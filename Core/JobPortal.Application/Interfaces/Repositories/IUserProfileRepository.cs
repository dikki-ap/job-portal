using JobPortal.Domain.Entities.Users;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IUserProfileRepository
{
    Task<(User User, UserProfile? Profile, IEnumerable<UserSkill> Skills)> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
    Task UpsertProfileAsync(User user, UserProfile profile, IEnumerable<UserSkill> skills, CancellationToken cancellationToken = default);
    Task<UserProfile?> LinkCvAsync(int userId, int documentId, CancellationToken cancellationToken = default);
    Task<bool> UnlinkCvAsync(int userId, CancellationToken cancellationToken = default);
    Task<(bool HasConsented, DateTime? ConsentedAt)> GetConsentStatusAsync(int userId, CancellationToken cancellationToken = default);
    Task<DateTime> RecordConsentAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<string>> GetInstitutionSuggestionsAsync(string query, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
