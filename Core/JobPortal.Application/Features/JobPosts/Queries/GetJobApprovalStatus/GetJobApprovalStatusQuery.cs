using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobPosts.Queries.GetJobApprovalStatus;

public record GetJobApprovalStatusQuery(int JobPostId) : IRequest<ApprovalStatusDto?>;
