// CompanyController.cs'de olması gereken:
using App.Services.CompanyServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace App.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]  // ✅ Bu attribute var mı?
    public class CompanyController(ICompanyService companyService) : CustomBaseController
    {
        [HttpGet]  // ✅ Bu attribute var mı?
        public async Task<IActionResult> GetAll() => CreateActionResult(await companyService.GetAllList());
    }
}

// BranchController.cs'de olması gereken:
namespace App.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]  // ✅ Bu attribute var mı?
    public class BranchController(IBranchService _branchService) : CustomBaseController
    {
        [HttpGet]  // ✅ Bu attribute var mı?
        public async Task<IActionResult> GetAll() => CreateActionResult(await _branchService.GetAllList());
    }
}

// MainGroupController.cs'de olması gereken:
namespace App.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]  // ✅ Bu attribute var mı?
    public class MainGroupController : CustomBaseController
    {
        [HttpGet]  // ✅ Bu attribute var mı?
        public async Task<IActionResult> GetAll() => CreateActionResult(await mainGroupService.GetAllListAsync());
    }
}

// CategoryController.cs'de olması gereken:
namespace App.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]  // ✅ Bu attribute var mı?
    public class CategoryController(ICategoryService categoryService) : CustomBaseController
    {
        [HttpGet]  // ✅ Bu attribute var mı?
        public async Task<IActionResult> GetAll() => CreateActionResult(await categoryService.GetAllList());
    }
}

