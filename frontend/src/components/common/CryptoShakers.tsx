import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface TokenProps {
  Logo: React.FC<{ size: number }>;
  name: string;
  delay: number;
  position: { x: number; y: number };
}

const SolanaLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.188 14.47c-.19.19-.19.5 0 .69l9.13 9.13c.19.19.5.19.69 0l9.13-9.13c.19-.19.19-.5 0-.69l-9.13-9.13c-.19-.19-.5-.19-.69 0l-9.13 9.13z" fill="#00FFA3"/>
    <path d="M6.188 9.13c-.19.19-.19.5 0 .69l9.13 9.13c.19.19.5.19.69 0l9.13-9.13c.19-.19.19-.5 0-.69l-9.13-9.13c-.19-.19-.5-.19-.69 0l-9.13 9.13z" fill="#00FFA3" fillOpacity="0.5"/>
  </svg>
);

const WifLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#FF6B35"/>
    <path d="M8 8h2v8H8V8zm6 0h2v8h-2V8z" fill="white"/>
    <path d="M10 10h4v4h-4v-4z" fill="white"/>
  </svg>
);

const PythLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#6366F1"/>
    <path d="M7 7h10v10H7V7zm2 2v6h6V9H9z" fill="white"/>
    <circle cx="12" cy="12" r="2" fill="#6366F1"/>
  </svg>
);

const EthereumLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#627EEA"/>
    <path d="M12.373 3v6.652l7.497 3.35L12.373 3z" fill="#C0CBF6"/>
    <path d="M12.373 3L4.876 13.002l7.497-3.35V3z" fill="white"/>
    <path d="M12.373 16.476v4.52L20 14.31l-7.627 2.166z" fill="#C0CBF6"/>
    <path d="M12.373 20.996v-4.52L4.876 14.31l7.497 6.686z" fill="white"/>
  </svg>
);

const BitcoinLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#F7931A"/>
    <path d="M17.092 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L9.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.026-1.256-.313-1.256-.313l-.858 1.978 2.25.562c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.128.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z" fill="white"/>
  </svg>
);

const Token: React.FC<TokenProps> = ({ Logo, name, delay, position }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ 
        y: -8,
        scale: 1.05,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      }}
      transition={{
        delay: delay,
        duration: 0.6,
        ease: "easeOut"
      }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: 'pointer'
      }}
    >
      {/* Container base */}
      <Box
        sx={{
          width: '45px',
          height: '35px',
          background: 'linear-gradient(145deg, #F5F5F5 0%, #E0E0E0 100%)',
          borderRadius: '6px 6px 12px 12px',
          boxShadow: '0 3px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.8)',
          border: '1px solid #D0D0D0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Container lid */}
        <Box
          sx={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '50px',
            height: '12px',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F0F0F0 100%)',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            border: '1px solid #E0E0E0',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '8px',
              height: '4px',
              background: '#D0D0D0',
              borderRadius: '2px'
            }
          }}
        />
        
        {/* Logo on container */}
        <Box
          sx={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Logo size={20} />
        </Box>
      </Box>
      
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: '-18px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontWeight: 600,
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          fontSize: '0.65rem',
          whiteSpace: 'nowrap'
        }}
      >
        {name}
      </Typography>
    </motion.div>
  );
};

const CryptoShakers: React.FC = () => {
  const tokens = [
    {
      Logo: SolanaLogo,
      name: "SOL"
    },
    {
      Logo: WifLogo,
      name: "WIF"
    },
    {
      Logo: PythLogo,
      name: "PYTH"
    }
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        position: 'relative',
        width: '100%',
        height: '300px'
      }}
    >
      {/* Chef's Prep Station Base */}
      <Box
        sx={{
          position: 'relative',
          width: '280px',
          height: '180px'
        }}
      >
        {/* Main prep station surface */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '60px',
            left: '0',
            width: '100%',
            height: '80px',
            background: 'linear-gradient(145deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.1)',
            border: '2px solid #654321'
          }}
        />
        
        {/* Prep station legs */}
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              bottom: '0',
              left: i < 2 ? '20px' : 'calc(100% - 35px)',
              width: '15px',
              height: '60px',
              background: 'linear-gradient(145deg, #654321 0%, #8B4513 100%)',
              borderRadius: '0 0 4px 4px',
              transform: i % 2 === 0 ? 'translateZ(0)' : 'translateX(-15px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          />
        ))}
        
        {/* Cutting board on station */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '140px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '120px',
            background: 'linear-gradient(145deg, #DEB887 0%, #F5DEB3 50%, #DEB887 100%)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 3px rgba(255,255,255,0.3)',
            border: '1px solid #D2B48C',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              bottom: '10px',
              border: '1px solid rgba(139, 69, 19, 0.2)',
              borderRadius: '4px'
            }
          }}
        />
        
        {/* Chef's knife */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '160px',
            right: '30px',
            width: '80px',
            height: '8px',
            background: 'linear-gradient(90deg, #8B4513 0%, #8B4513 25%, #C0C0C0 25%, #C0C0C0 100%)',
            borderRadius: '0 4px 4px 0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transform: 'rotate(-15deg)',
            '&::before': {
              content: '""',
              position: 'absolute',
              right: '0',
              top: '-2px',
              width: '60px',
              height: '12px',
              background: 'linear-gradient(145deg, #E5E5E5 0%, #C0C0C0 100%)',
              borderRadius: '0 2px 2px 0',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
            }
          }}
        />
        
        {/* Crypto containers positioned neatly on the cutting board */}
        {tokens.map((token, index) => (
          <Token 
            key={index}
            Logo={token.Logo} 
            name={token.name} 
            delay={0.2 * index} 
            position={{ x: 55 + 60 * index, y: 50 }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default CryptoShakers; 