from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from app.utils.auth_utils import get_current_user
from app.database import initialize_database
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# Routers
from app.routers.customer_router import router as customer_router
from app.routers.windmill_router import router as windmill_router
from app.routers.edc_router import router as edc_router
from app.routers.email_router import router as email_router
from app.routers.total_shares_router import router as total_router
from app.routers.customer_share_router import router as customer_share_router
from app.routers.eb_bill_router import router as eb_bill_router
from app.routers.eb_statement_upload import router as eb_upload_router   
from app.routers.eb_statement_solar import router as eb_solar_router
from app.routers.generation import router as generation
from app.routers.auth_routes import router as auth_routes
from app.routers.investors_routes import router as investors_routes
from app.routers.capacity_routes import router as capacity_routes
from app.routers.consumption_routes import router as consumption_routes
from app.routers.transmission_routes import router as transmission_routes
from app.routers.actual_allotment_v5 import router as actual_allotment_router
from app.routers.consumption_request import router as consumption_req_router
from app.routers.charge_values_router import router as charge_values_router
from app.routers.charge_values_solar_router import router as charge_values_solar_router
from app.routers.client_invoice_router import router as client_invoice_router
from app.routers.energy_allotment_router import router as energy_allotment_router
from app.routers.audit_router import router as audit_router
from app.routers.error_log_router import router as error_log_router
from app.routers.session_router import router as session_router
from app.routers.login_log_router import router as login_log_router
from app.routers.banking_router import router as banking_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Running database initialization on startup...")
    initialize_database()
    yield
    print("Application shutdown.")

app = FastAPI(lifespan=lifespan)

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    from app.utils.logger import log_error
    error_details = traceback.format_exc()
    print(f"GLOBAL ERROR: {error_details}")
    
    # Log to database
    try:
        log_error(
            module_name="Backend",
            error_message=str(exc),
            error_stack=error_details,
            endpoint=str(request.url),
            method=request.method,
            page_name=request.url.path,
            ip_address=request.client.host if request.client else None
        )
    except Exception as log_err:
        print(f"Failed to log global error to DB: {log_err}")

    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc), "traceback": error_details},
    )

from fastapi import HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    # Log only server errors (500+)
    if exc.status_code >= 500:
        from app.utils.logger import log_error
        try:
            log_error(
                module_name="Backend-API",
                error_message=str(exc.detail),
                endpoint=str(request.url),
                method=request.method,
                page_name=request.url.path,
                ip_address=request.client.host if request.client else None
            )
        except:
            pass
            
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}
    )
# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API routes
auth_dep = [Depends(get_current_user)]

app.include_router(customer_router, prefix="/api", dependencies=auth_dep)
app.include_router(windmill_router, prefix="/api", dependencies=auth_dep)
app.include_router(edc_router, prefix="/api", dependencies=auth_dep)
app.include_router(email_router, prefix="/api", dependencies=auth_dep)
app.include_router(total_router, prefix="/api", dependencies=auth_dep)
app.include_router(customer_share_router, prefix="/api", dependencies=auth_dep)
app.include_router(eb_bill_router, prefix="/api", dependencies=auth_dep)

app.include_router(eb_upload_router, prefix="/api", dependencies=auth_dep)
app.include_router(eb_solar_router, prefix="/api", dependencies=auth_dep)
app.include_router(generation, prefix="/api", dependencies=auth_dep)
app.include_router(auth_routes, prefix="/api") # Auth routes are public
app.include_router(investors_routes, prefix="/api", dependencies=auth_dep)
app.include_router(capacity_routes, prefix="/api", dependencies=auth_dep)
app.include_router(consumption_routes, prefix="/api", dependencies=auth_dep)
app.include_router(consumption_req_router, prefix="/api") # We'll handle Depends(get_current_user) inside the routes to get the user object
app.include_router(transmission_routes, prefix="/api", dependencies=auth_dep)
app.include_router(actual_allotment_router, prefix="/api", dependencies=auth_dep)
app.include_router(charge_values_router, prefix="/api", dependencies=auth_dep)
app.include_router(charge_values_solar_router, prefix="/api", dependencies=auth_dep)
app.include_router(client_invoice_router, prefix="/api", dependencies=auth_dep)
app.include_router(energy_allotment_router, prefix="/api", dependencies=auth_dep)
app.include_router(audit_router, prefix="/api", dependencies=auth_dep)
app.include_router(error_log_router, prefix="/api")
app.include_router(session_router, prefix="/api", dependencies=auth_dep)
app.include_router(login_log_router, prefix="/api", dependencies=auth_dep)
app.include_router(banking_router, prefix="/api", dependencies=auth_dep)


