using JobPortal.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController(ApplicationDbContext context, ILogger<DocumentsController> logger) : ControllerBase
{
    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id, CancellationToken cancellationToken)
    {
        var doc = await context.ApplicationDocuments
            .Include(ad => ad.Document)
            .FirstOrDefaultAsync(ad => ad.Id == id, cancellationToken);

        if (doc?.Document is null)
        {
            logger.LogWarning("Download: document id={Id} not found", id);
            return NotFound();
        }

        if (!System.IO.File.Exists(doc.Document.FilePath))
        {
            logger.LogWarning("Download: file not found on disk path={Path}", doc.Document.FilePath);
            return NotFound();
        }

        var fileName = Path.GetFileName(doc.Document.FilePath);
        logger.LogInformation("Download: serving document id={Id} file={File}", id, fileName);
        return PhysicalFile(doc.Document.FilePath, doc.Document.FileType, fileName);
    }
}
