using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<UserDto?>;
