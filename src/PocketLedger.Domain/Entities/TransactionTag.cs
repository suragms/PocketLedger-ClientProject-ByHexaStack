namespace PocketLedger.Domain.Entities;

public class TransactionTag
{
    public int TransactionId { get; set; }
    public int TagId { get; set; }

    public Transaction Transaction { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
