module.exports = (req, res) => {
  res.json({
    vercel: !!process.env.VERCEL,
    mongoUriSet: !!process.env.MONGO_URI,
    jwtSecretSet: !!process.env.JWT_SECRET,
    telegramBotTokenSet: !!process.env.TELEGRAM_BOT_TOKEN,
    telegramChannelIdSet: !!process.env.TELEGRAM_CHANNEL_ID,
    telegramConfigReady: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID),
    telegramPublicUrlSet: !!(
      process.env.JOB_PUBLIC_BASE_URL
      || process.env.TELEGRAM_JOB_URL_TEMPLATE
      || process.env.TELEGRAM_APPLY_URL
    ),
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('MONGO')
      || key.includes('JWT')
      || key.includes('PORT')
      || key.includes('TELEGRAM')
      || key.includes('FRONTEND')
      || key.includes('JOB_PUBLIC_BASE_URL')
    )
  });
};
