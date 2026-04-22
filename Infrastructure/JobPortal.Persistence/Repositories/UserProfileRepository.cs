using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Users;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class UserProfileRepository(ApplicationDbContext context) : IUserProfileRepository
{
    public async Task<(User User, UserProfile? Profile, IEnumerable<UserSkill> Skills)> GetProfileAsync(
        int userId, CancellationToken cancellationToken = default)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"User {userId} not found.");

        var profile = await context.UserProfiles
            .Include(p => p.EducationLevel)
            .Include(p => p.CvDocument)
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        var skills = await context.UserSkills
            .Include(s => s.Skill)
            .Where(s => s.UserId == userId)
            .ToListAsync(cancellationToken);

        return (user, profile, skills);
    }

    public async Task UpsertProfileAsync(
        User user, UserProfile profile, IEnumerable<UserSkill> skills, CancellationToken cancellationToken = default)
    {
        context.Users.Update(user);

        var existing = await context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);

        if (existing is null)
        {
            profile.UserId = user.Id;
            if (string.IsNullOrEmpty(profile.NIK))
                profile.NIK = $"TMP{user.Id:D17}";
            profile.CreatedAt = profile.UpdatedAt ?? DateTime.UtcNow;
            profile.CreatedByUserId = profile.UpdatedByUserId ?? user.Id;
            await context.UserProfiles.AddAsync(profile, cancellationToken);
        }
        else
        {
            existing.PhoneNumber = profile.PhoneNumber;
            existing.EducationLevelId = profile.EducationLevelId;
            existing.UpdatedAt = profile.UpdatedAt;
            existing.UpdatedByUserId = profile.UpdatedByUserId;
            context.UserProfiles.Update(existing);
        }

        var existingSkills = await context.UserSkills
            .Where(s => s.UserId == user.Id)
            .ToListAsync(cancellationToken);
        context.UserSkills.RemoveRange(existingSkills);

        var skillList = skills.ToList();
        if (skillList.Count > 0)
            await context.UserSkills.AddRangeAsync(skillList, cancellationToken);
    }

    public async Task<UserProfile?> LinkCvAsync(
        int userId, int documentId, CancellationToken cancellationToken = default)
    {
        var profile = await context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile is null)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (user is null) return null;
            profile = new UserProfile
            {
                UserId = userId,
                NIK = $"TMP{userId:D17}",
                PhoneNumber = string.Empty,
                CvDocumentId = documentId,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
            };
            await context.UserProfiles.AddAsync(profile, cancellationToken);
        }
        else
        {
            profile.CvDocumentId = documentId;
            profile.UpdatedAt = DateTime.UtcNow;
            profile.UpdatedByUserId = userId;
            context.UserProfiles.Update(profile);
        }

        return profile;
    }

    public async Task<bool> UnlinkCvAsync(int userId, CancellationToken cancellationToken = default)
    {
        var profile = await context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (profile is null) return false;

        profile.CvDocumentId = null;
        profile.UpdatedAt = DateTime.UtcNow;
        profile.UpdatedByUserId = userId;
        context.UserProfiles.Update(profile);
        return true;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
