namespace JobPortal.Application.DTOs;

public record BulkOperationResultDto(int Succeeded, int Skipped, List<string> Errors);
