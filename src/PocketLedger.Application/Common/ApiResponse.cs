namespace PocketLedger.Application.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public string? TraceId { get; set; }

    public static ApiResponse<T> SuccessResponse(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> FailResponse(string message, string? traceId = null) =>
        new() { Success = false, Message = message, TraceId = traceId };
}
