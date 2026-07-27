using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Persistence.Context;
using JobPortal.Web.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController(
    ApplicationDbContext context,
    IStorageService storageService,
    ICurrentUserService currentUserService,
    ILogger<DocumentsController> logger) : ControllerBase
{
    [HttpPost("upload")]
    [EnableRateLimiting("upload")]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile file,
        [FromForm] int documentTypeId,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        var userId = currentUserService.GetCurrentUserId();
        var externalId = currentUserService.GetCurrentUserExternalId();
        if (userId is null || externalId is null)
            return Unauthorized();

        var docType = await context.DocumentTypes
            .Include(dt => dt.MimeTypes)
            .FirstOrDefaultAsync(dt => dt.Id == documentTypeId, cancellationToken);

        if (docType is null)
            return NotFound(new { error = "Document type not found." });

        var allowedMimes = docType.MimeTypes.Select(m => m.MimeType).ToHashSet();
        if (allowedMimes.Count > 0 && !allowedMimes.Contains(file.ContentType))
            return BadRequest(new { error = $"File type '{file.ContentType}' is not allowed for this document type." });

        var maxBytes = (long)docType.MaxFileSizeMb * 1024 * 1024;
        if (file.Length > maxBytes)
            return BadRequest(new { error = $"File exceeds the maximum size of {docType.MaxFileSizeMb} MB." });

        await using (var sigStream = file.OpenReadStream())
        {
            if (!FileSignatureValidator.IsValidSignature(sigStream, file.ContentType))
                return BadRequest(new { error = "File content does not match the declared file type." });
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        string storageKey;
        await using (var stream = file.OpenReadStream())
        {
            storageKey = await storageService.UploadAsync(stream, extension, file.ContentType, externalId, cancellationToken);
        }

        var doc = new Document
        {
            FilePath = storageKey,
            OriginalFileName = file.FileName,
            FileType = file.ContentType,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId.Value,
        };
        context.Documents.Add(doc);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Upload: document id={Id} key={Key} user={UserId}", doc.Id, storageKey, userId);
        return Ok(new { id = doc.Id, originalFileName = doc.OriginalFileName });
    }

    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id, CancellationToken cancellationToken)
    {
        var appDoc = await context.ApplicationDocuments
            .Include(ad => ad.Document)
            .Include(ad => ad.Application)
                .ThenInclude(a => a.JobPost)
            .FirstOrDefaultAsync(ad => ad.Id == id, cancellationToken);

        if (appDoc?.Document is null)
        {
            logger.LogWarning("Download: document id={Id} not found", id);
            return NotFound();
        }

        var isHrOrAdmin = User.IsInRole("Admin") || User.IsInRole("HR");

        if (appDoc.IsCompanyDocument)
        {
            // Company documents are confidential — HR/Admin always allowed; DM if in-scope; candidates never.
            if (!isHrOrAdmin)
            {
                var email = currentUserService.GetCurrentUserEmail()?.Trim().ToLowerInvariant();
                var dm = string.IsNullOrEmpty(email)
                    ? null
                    : await context.DepartmentManagers
                        .Include(m => m.Departments)
                        .FirstOrDefaultAsync(m => m.Email.ToLower() == email, cancellationToken);

                if (dm is null || !dm.Departments.Any(d => d.DepartmentId == appDoc.Application.JobPost?.DepartmentId))
                    return Forbid();
            }
        }
        else
        {
            // Candidate documents: HR/Admin always allowed; candidates can access their own; DM if in-scope.
            if (!isHrOrAdmin && appDoc.Application.UserId != currentUserService.GetCurrentUserId())
            {
                var email = currentUserService.GetCurrentUserEmail()?.Trim().ToLowerInvariant();
                var dm = string.IsNullOrEmpty(email)
                    ? null
                    : await context.DepartmentManagers
                        .Include(m => m.Departments)
                        .FirstOrDefaultAsync(m => m.Email.ToLower() == email, cancellationToken);

                if (dm is null || !dm.Departments.Any(d => d.DepartmentId == appDoc.Application.JobPost?.DepartmentId))
                    return Forbid();
            }
        }

        var (stream, contentType) = await storageService.DownloadAsync(appDoc.Document.FilePath, cancellationToken);
        var fileName = appDoc.Document.OriginalFileName;

        logger.LogInformation("Download: streaming document id={Id}", id);
        return File(stream, contentType, fileName);
    }
}
