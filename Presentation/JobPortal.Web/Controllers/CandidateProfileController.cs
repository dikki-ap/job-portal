using JobPortal.Application.Features.CandidateProfile.Commands.UpsertCandidateProfile;
using JobPortal.Application.Features.CandidateProfile.Queries.GetCandidateProfile;
using JobPortal.Application.Features.CandidateProfile.Queries.GetInstitutionSuggestions;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Persistence.Context;
using JobPortal.Web.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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

    [HttpGet("institutions")]
    public async Task<IActionResult> GetInstitutionSuggestions(
        [FromQuery] string q, CancellationToken cancellationToken)
    {
        if (q?.Length > 100) q = q[..100];
        var result = await mediator.Send(new GetInstitutionSuggestionsQuery(q ?? string.Empty), cancellationToken);
        return Ok(result);
    }

    private static readonly HashSet<string> CvAllowedMimes =
    [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    private const int CvMaxMb = 3;

    [HttpPost("cv")]
    [EnableRateLimiting("upload")]
    public async Task<IActionResult> UploadCv(
        [FromForm] IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        var userId = currentUserService.GetCurrentUserId();
        var externalId = currentUserService.GetCurrentUserExternalId();
        if (userId is null || externalId is null) return Unauthorized();

        if (!CvAllowedMimes.Contains(file.ContentType))
            return BadRequest(new { error = "Only PDF, DOC, and DOCX files are allowed." });

        if (file.Length > (long)CvMaxMb * 1024 * 1024)
            return BadRequest(new { error = $"File exceeds the maximum size of {CvMaxMb} MB." });

        await using (var sigStream = file.OpenReadStream())
        {
            if (!FileSignatureValidator.IsValidSignature(sigStream, file.ContentType))
                return BadRequest(new { error = "File content does not match the declared file type." });
        }

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

        await profileRepository.LinkCvAsync(userId.Value, doc.Id, cancellationToken);
        await profileRepository.SaveChangesAsync(cancellationToken);

        logger.LogInformation("CV uploaded: user={UserId} document={DocId}", userId, doc.Id);
        return Ok(new { documentId = doc.Id, originalFileName = file.FileName });
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

        var (stream, contentType) = await storageService.DownloadAsync(profile.CvDocument.FilePath, cancellationToken);
        var fileName = profile.CvDocument.OriginalFileName;

        return File(stream, contentType, fileName);
    }
}
