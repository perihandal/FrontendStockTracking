// Backend'de JWT Token oluştururken (C# .NET Core)

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

// JWT Token oluşturma metodu
public string GenerateJwtToken(User user)
{
    var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
        new Claim(JwtRegisteredClaimNames.Name, user.FullName),
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        // ÖNEMLİ: Microsoft Identity Claims formatında role ekleyin
        new Claim(ClaimTypes.Role, user.Role) // veya user.Roles.FirstOrDefault()
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddMinutes(60),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}

