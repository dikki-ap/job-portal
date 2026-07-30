using ClosedXML.Excel;
using JobPortal.Application.Features.Analytics.Queries.GetApplicationsForAnalytics;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Policy = "HrOrAdmin")]
public class AnalyticsController(IMediator mediator) : ControllerBase
{
    [HttpGet("applications")]
    public async Task<IActionResult> GetApplications(CancellationToken ct)
    {
        var result = await mediator.Send(new GetApplicationsForAnalyticsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("export")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    [EnableRateLimiting("download")]
    public async Task<IActionResult> Export([FromQuery] DateTime? since, CancellationToken ct)
    {
        var items = await mediator.Send(new GetApplicationsForAnalyticsQuery(), ct);
        if (since.HasValue)
            items = items.Where(a => DateTime.Parse(a.AppliedAt) >= since.Value.Date);

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Analytics");

        string[] headers = ["Code", "Candidate", "Job Title", "Department", "Status", "Applied At", "Source", "HR Rating", "DM Rating"];
        for (int i = 0; i < headers.Length; i++)
            sheet.Cell(1, i + 1).Value = headers[i];

        int row = 2;
        foreach (var a in items)
        {
            sheet.Cell(row, 1).Value = a.Code;
            sheet.Cell(row, 2).Value = a.CandidateName ?? "";
            sheet.Cell(row, 3).Value = a.JobPostTitle;
            sheet.Cell(row, 4).Value = a.JobPostDepartmentName ?? "";
            sheet.Cell(row, 5).Value = a.Status;
            sheet.Cell(row, 6).Value = a.AppliedAt.Length >= 10 ? a.AppliedAt[..10] : a.AppliedAt;
            sheet.Cell(row, 7).Value = a.Source ?? "";
            sheet.Cell(row, 8).Value = a.Rating?.ToString() ?? "";
            sheet.Cell(row, 9).Value = a.DmRating?.ToString() ?? "";
            row++;
        }

        sheet.Columns().AdjustToContents();
        var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        return File(stream,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"analytics-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }
}
