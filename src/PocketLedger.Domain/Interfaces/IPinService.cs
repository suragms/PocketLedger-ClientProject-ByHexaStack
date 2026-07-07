namespace PocketLedger.Domain.Interfaces;

public interface IPinService
{
    string HashPin(string pin);
    bool VerifyPin(string pin, string hash);
}
