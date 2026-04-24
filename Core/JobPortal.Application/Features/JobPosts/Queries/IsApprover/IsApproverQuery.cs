using MediatR;

namespace JobPortal.Application.Features.JobPosts.Queries.IsApprover;

public record IsApproverQuery : IRequest<bool>;
