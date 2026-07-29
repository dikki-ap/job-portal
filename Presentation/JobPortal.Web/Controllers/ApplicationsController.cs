using ClosedXML.Excel;
using JobPortal.Application.Common;
using JobPortal.Application.Features.Applications.Commands.AcceptApplication;
using JobPortal.Application.Features.Applications.Commands.BulkAcceptApplication;
using JobPortal.Application.Features.Applications.Commands.BulkRejectApplication;
using JobPortal.Application.Features.Applications.Commands.BulkUpdateApplicationStep;
using JobPortal.Application.Features.Applications.Commands.RateApplication;
using JobPortal.Application.Features.Applications.Commands.RejectApplication;
using JobPortal.Application.Features.Applications.Commands.ScheduleApplicationStep;
using JobPortal.Application.Features.Applications.Commands.UpdateApplicationStep;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Features.Applications.Queries.GetApplicationByCode;
using JobPortal.Application.Features.Applications.Queries.GetApplicationById;
using JobPortal.Application.Features.Applications.Queries.GetPagedApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize(Policy = "HrOrAdmin")]
public class ApplicationsController(
    IMediator mediator,
    IApplicationRepository repository,
    ILogger<ApplicationsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? jobPostId,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: jobPostId={JobPostId} status={Status}", jobPostId, status);
        var result = await mediator.Send(new GetAllApplicationsQuery(jobPostId, status), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetApplicationByIdQuery(id), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> GetByCode(string code, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetApplicationByCodeQuery(code), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{id:int}/steps/{stepId:int}/pass")]
    public async Task<IActionResult> PassStep(int id, int stepId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(
                new UpdateApplicationStepCommand(id, stepId, ApplicationStepStatus.Passed),
                cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/steps/{stepId:int}/fail")]
    public async Task<IActionResult> FailStep(int id, int stepId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(
                new UpdateApplicationStepCommand(id, stepId, ApplicationStepStatus.Failed),
                cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/accept")]
    public async Task<IActionResult> Accept(int id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new AcceptApplicationCommand(id), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new RejectApplicationCommand(id), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    public record ScheduleStepRequest(DateTime? ScheduledAt, string? ScheduledLocation, string? ScheduledNote);

    [HttpPost("{id:int}/steps/{stepId:int}/schedule")]
    public async Task<IActionResult> ScheduleStep(int id, int stepId, [FromBody] ScheduleStepRequest req, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(
                new ScheduleApplicationStepCommand(id, stepId, req.ScheduledAt, req.ScheduledLocation, req.ScheduledNote),
                cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    public record RateRequest(int Rating, string? Note);

    [HttpPost("{id:int}/rate")]
    public async Task<IActionResult> Rate(int id, [FromBody] RateRequest req, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new RateApplicationCommand(id, req.Rating, req.Note), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("bulk-step")]
    public async Task<IActionResult> BulkUpdateStep(
        [FromBody] BulkUpdateApplicationStepCommand command,
        CancellationToken cancellationToken)
    {
        if (command.ApplicationIds is null || command.ApplicationIds.Count == 0)
            return BadRequest(new { error = "No application IDs provided." });
        if (command.Action is not (ApplicationStepStatus.Passed or ApplicationStepStatus.Failed))
            return BadRequest(new { error = "Action must be 'Passed' or 'Failed'." });

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("bulk-accept")]
    public async Task<IActionResult> BulkAccept(
        [FromBody] BulkAcceptApplicationCommand command,
        CancellationToken cancellationToken)
    {
        if (command.ApplicationIds is null || command.ApplicationIds.Count == 0)
            return BadRequest(new { error = "No application IDs provided." });

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("bulk-reject")]
    public async Task<IActionResult> BulkReject(
        [FromBody] BulkRejectApplicationCommand command,
        CancellationToken cancellationToken)
    {
        if (command.ApplicationIds is null || command.ApplicationIds.Count == 0)
            return BadRequest(new { error = "No application IDs provided." });

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? jobPostId,
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetPagedApplicationsQuery(jobPostId, status, search, page, pageSize),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("export")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> Export(
        [FromQuery] int? jobPostId,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var applications = await repository.GetAllAsync(jobPostId, status, cancellationToken);

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Applications");

        string[] headers = ["Code", "Candidate Name", "Email", "Phone", "Job Title", "Department",
            "Status", "Source", "Applied At", "HR Rating", "HR Note", "DM Rating", "DM Note", "Current Step"];
        for (int i = 0; i < headers.Length; i++)
            sheet.Cell(1, i + 1).Value = headers[i];

        int row = 2;
        foreach (var a in applications)
        {
            var currentStep = a.Steps?.OrderBy(s => s.StepOrder)
                .FirstOrDefault(s => s.Status == ApplicationStepStatus.Pending)?.StepName
                ?? a.Steps?.OrderByDescending(s => s.StepOrder).FirstOrDefault()?.StepName;

            sheet.Cell(row, 1).Value = a.Code;
            sheet.Cell(row, 2).Value = $"{a.User?.FirstName} {a.User?.LastName}".Trim();
            sheet.Cell(row, 3).Value = a.User?.Email;
            sheet.Cell(row, 4).Value = a.User?.Profile?.PhoneNumber;
            sheet.Cell(row, 5).Value = a.JobPost?.Title;
            sheet.Cell(row, 6).Value = a.JobPost?.Department?.Name;
            sheet.Cell(row, 7).Value = a.Status;
            sheet.Cell(row, 8).Value = a.Source;
            sheet.Cell(row, 9).Value = a.AppliedAt.ToString("yyyy-MM-dd HH:mm");
            sheet.Cell(row, 10).Value = a.Rating?.ToString() ?? "";
            sheet.Cell(row, 11).Value = a.RatingNote;
            sheet.Cell(row, 12).Value = a.DmRating?.ToString() ?? "";
            sheet.Cell(row, 13).Value = a.DmRatingNote;
            sheet.Cell(row, 14).Value = currentStep;
            row++;
        }

        sheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"applications-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }
}
