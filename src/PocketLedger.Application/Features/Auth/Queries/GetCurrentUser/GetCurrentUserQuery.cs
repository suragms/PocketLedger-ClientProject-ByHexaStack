using MediatR;
using PocketLedger.Application.Features.Auth.DTOs;

namespace PocketLedger.Application.Features.Auth.Queries.GetCurrentUser;

public class GetCurrentUserQuery : IRequest<UserProfile> { }
