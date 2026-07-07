using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common.Exceptions;
using System.Net;
using System.Linq;
using System.Collections.Generic;

namespace PocketLedger.API.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (statusCode, message, errors) = exception switch
        {
            ValidationException validationEx =>
                (HttpStatusCode.BadRequest, "Validation failed", validationEx.Errors),
            FluentValidation.ValidationException fluentValidationEx =>
                (HttpStatusCode.BadRequest, "Validation failed", (IDictionary<string, string[]>)fluentValidationEx.Errors
                    .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
                    .ToDictionary(g => g.Key, g => g.ToArray())),
            NotFoundException notFoundEx =>
                (HttpStatusCode.NotFound, notFoundEx.Message, null),
            UnauthorizedAccessException =>
                (HttpStatusCode.Unauthorized, "Unauthorized", null),
            InvalidOperationException invalidOpEx =>
                (HttpStatusCode.BadRequest, invalidOpEx.Message, null),
            _ =>
                (HttpStatusCode.InternalServerError, "An unexpected error occurred", null)
        };

        httpContext.Response.StatusCode = (int)statusCode;

        var response = new ProblemDetails
        {
            Title = message,
            Status = (int)statusCode,
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        };

        if (errors != null)
        {
            response.Extensions["errors"] = errors;
        }

        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);
        return true;
    }
}
