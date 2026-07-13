using AutoMapper;
using PocketLedger.Application.Common.Mappings;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Goals.DTOs;

public class GoalDto : IMapFrom<Goal>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime TargetDate { get; set; }
    public int? LinkedAccountId { get; set; }
    public string? LinkedAccountName { get; set; }
    public bool IsArchived { get; set; }
    public double PercentComplete => TargetAmount > 0 ? (double)(CurrentAmount / TargetAmount) * 100 : 0;
    public decimal RemainingAmount => TargetAmount - CurrentAmount;
    public bool IsCompleted => CurrentAmount >= TargetAmount;
    public DateTime CreatedAt { get; set; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<Goal, GoalDto>()
            .ForMember(d => d.LinkedAccountName, opt => opt.MapFrom(s => s.LinkedAccount != null ? s.LinkedAccount.Name : null));
    }
}
