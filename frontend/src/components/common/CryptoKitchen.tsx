import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import greedLogo from '../../assets/images/greed_logo.png';

const CryptoKitchen: React.FC = () => {

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 500,
        background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)',
        borderRadius: 6,
        overflow: 'hidden',
        border: '2px solid #E2E8F0',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(0, 212, 170, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(66, 165, 245, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(255, 107, 107, 0.03) 0%, transparent 50%)
          `,
          zIndex: 1
        }
      }}
    >
      {/* Greed Logo - Much Bigger */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '20px'
        }}
      >
        <Box
          component="img"
          src={greedLogo}
          alt="Greed Logo"
          sx={{
            width: { xs: '90%', sm: '85%', md: '80%', lg: '75%' },
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '85%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.2))'
          }}
        />
      </motion.div>

      {/* Meet our Head Trading Chef - Lower and One Line */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        style={{
          position: 'absolute',
          bottom: 10,
          left: '30%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          textAlign: 'center',
          width: '60%',
          maxWidth: '300px'
        }}
      >
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 6,
            px: 3,
            py: 1.5,
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(15px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#2D3748',
              fontWeight: 600,
              textAlign: 'center',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              lineHeight: 1.2,
              margin: 0,
              whiteSpace: 'nowrap',
              fontFamily: '"Comic Sans MS", "Comic Sans", cursive, "Segoe UI Emoji", "Apple Color Emoji", sans-serif',
              letterSpacing: '0.3px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
              '&::before': {
                content: '"👨‍🍳 "',
                fontSize: '1.1em'
              }
            }}
          >
            Yoree: Head Trading Chef
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default CryptoKitchen;