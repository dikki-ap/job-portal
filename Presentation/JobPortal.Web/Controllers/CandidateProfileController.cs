using JobPortal.Application.Features.CandidateProfile.Commands.UpsertCandidateProfile;
using JobPortal.Application.Features.CandidateProfile.Queries.GetCandidateProfile;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Persistence.Context;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/candidate-profile")]
[Authorize]
public class CandidateProfileController(
    IMediator mediator,
    IUserProfileRepository profileRepository,
    IStorageService storageService,
    ICurrentUserService currentUserService,
    ApplicationDbContext dbContext,
    ILogger<CandidateProfileController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCandidateProfileQuery(), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Upsert([FromBody] UpsertCandidateProfileCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { error = ex.Message }); }
    }

    [HttpPost("cv")]
    public async Task<IActionResult> UploadCv(
        [FromForm] IFormFile file,
        [FromForm] int documentTypeId,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        var userId = currentUserService.GetCurrentUserId();
        var externalId = currentUserService.GetCurrentUserExternalId();
        if (userId is null || externalId is null) return Unauthorized();

        var docType = await dbContext.DocumentTypes
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

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        string storageKey;
        await using (var stream = file.OpenReadStream())
            storageKey = await storageService.UploadAsync(stream, extension, file.ContentType, externalId, cancellationToken);

        var doc = new Document
        {
            FilePath = storageKey,
            OriginalFileName = file.FileName,
            FileType = file.ContentType,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId.Value,
        };
        dbContext.Documents.Add(doc);
        await dbContext.SaveChangesAsync(cancellationToken);

        await profileRepository.LinkCvAsync(userId.Value, doc.Id, documentTypeId, file.FileName, cancellationToken);
        await profileRepository.SaveChangesAsync(cancellationToken);

        logger.LogInformation("CV uploaded: user={UserId} document={DocId}", userId, doc.Id);
        return Ok(new { documentId = doc.Id, documentTypeId, originalFileName = file.FileName });
    }

    [HttpDelete("cv")]
    public async Task<IActionResult> RemoveCv(CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId();
        if (userId is null) return Unauthorized();

        await profileRepository.UnlinkCvAsync(userId.Value, cancellationToken);
        await profileRepository.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("cv/download")]
    public async Task<IActionResult> DownloadCv(CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var profile = await dbContext.UserProfiles
            .Include(p => p.CvDocument)
            .FirstOrDefaultAsync(p => p.UserId == userId.Value, cancellationToken);

        if (profile?.CvDocument is null)
            return NotFound(new { error = "No CV uploaded to profile." });

        var url = await storageService.GeneratePresignedUrlAsync(
            profile.CvDocument.FilePath, expiryMinutes: 15, cancellationToken);
        return Redirect(url);
    }
}
