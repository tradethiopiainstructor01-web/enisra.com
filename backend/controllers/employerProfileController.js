const employerProfile = {
  name: process.env.EMPLOYER_NAME || 'Enisra Talent & Placement',
  logo: process.env.EMPLOYER_LOGO_URL || 'https://enisra.com/logo.jpg',
  industry:
    process.env.EMPLOYER_INDUSTRY ||
    'Talent solutions, career services, and international placement support',
  size: process.env.EMPLOYER_SIZE || '200–500 employees',
  locations: process.env.EMPLOYER_LOCATIONS
    ? process.env.EMPLOYER_LOCATIONS.split('|')
    : ['Addis Ababa, Ethiopia', 'Dubai, UAE', 'Remote global team'],
  description:
    process.env.EMPLOYER_DESCRIPTION ||
    'We build trusted bridges between Ethiopian talent and international employers by blending data, coaching, and local insight.',
  website: process.env.EMPLOYER_WEBSITE || 'https://enisra.com',
  social: [
    {
      label: 'LinkedIn',
      url: process.env.EMPLOYER_SOCIAL_LINKEDIN || 'https://www.linkedin.com/company/enisra',
    },
    {
      label: 'Telegram',
      url: process.env.EMPLOYER_SOCIAL_TELEGRAM || 'https://t.me/enisrajobmatching',
    },
  ],
  verified: process.env.EMPLOYER_VERIFIED !== 'false',
  dashboardUrl: process.env.EMPLOYER_DASHBOARD_URL || '/employer/dashboard',
  profileEditUrl: process.env.EMPLOYER_PROFILE_EDIT_URL || '/employer/profile/edit',
};

const getEmployerProfile = (req, res) => {
  res.json({
    success: true,
    data: employerProfile,
    message: 'Employer profile loaded successfully',
  });
};

module.exports = { getEmployerProfile };
