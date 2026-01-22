import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Slider,
  Stack,
  IconButton,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Palette as PaletteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface AvatarCreatorProps {
  onSave?: (avatarData: AvatarData) => void;
  initialAvatar?: AvatarData;
}

export interface AvatarData {
  backgroundColor: string;
  icon: string;
  gradient: string;
  borderColor: string;
  size: number;
  name?: string;
}

const AvatarCreator: React.FC<AvatarCreatorProps> = ({ onSave, initialAvatar }) => {
  const { theme } = useTheme();
  const [avatarData, setAvatarData] = useState<AvatarData>(
    initialAvatar || {
      backgroundColor: '#667eea',
      icon: '🤖',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderColor: '#667eea',
      size: 100,
      name: '',
    }
  );

  const colorPresets = [
    { name: 'Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
    { name: 'Blue', gradient: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)', color: '#00D4FF' },
    { name: 'Green', gradient: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)', color: '#00FF88' },
    { name: 'Orange', gradient: 'linear-gradient(135deg, #FFA726 0%, #FF8C00 100%)', color: '#FFA726' },
    { name: 'Pink', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f093fb' },
    { name: 'Red', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: '#EF4444' },
  ];

  const iconOptions = ['🤖', '🧠', '⚡', '🚀', '💎', '🌟', '🎯', '🔥', '💫', '🎨', '🔮', '✨'];

  const handleColorChange = (preset: typeof colorPresets[0]) => {
    setAvatarData({
      ...avatarData,
      gradient: preset.gradient,
      backgroundColor: preset.color,
      borderColor: preset.color,
    });
  };

  const handleIconChange = (icon: string) => {
    setAvatarData({ ...avatarData, icon });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(avatarData);
    }
  };

  const handleRandomize = () => {
    const randomColor = colorPresets[Math.floor(Math.random() * colorPresets.length)];
    const randomIcon = iconOptions[Math.floor(Math.random() * iconOptions.length)];
    setAvatarData({
      ...avatarData,
      gradient: randomColor.gradient,
      backgroundColor: randomColor.color,
      borderColor: randomColor.color,
      icon: randomIcon,
    });
  };

  return (
    <Card
      sx={{
        borderRadius: '20px',
        background: theme.palette.mode === 'dark' ? 'rgba(26, 31, 58, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <PaletteIcon /> Create Your Avatar
        </Typography>

        <Grid container spacing={4}>
          {/* Preview */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Avatar
                  sx={{
                    width: avatarData.size,
                    height: avatarData.size,
                    background: avatarData.gradient,
                    border: `4px solid ${avatarData.borderColor}`,
                    boxShadow: `0 8px 32px ${avatarData.borderColor}40`,
                    fontSize: avatarData.size * 0.5,
                  }}
                >
                  {avatarData.icon}
                </Avatar>
              </motion.div>
              <TextField
                fullWidth
                label="Avatar Name"
                value={avatarData.name}
                onChange={(e) => setAvatarData({ ...avatarData, name: e.target.value })}
                placeholder="Enter avatar name..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Box>
          </Grid>

          {/* Controls */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Color Presets */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                  Color Theme
                </Typography>
                <Grid container spacing={2}>
                  {colorPresets.map((preset) => (
                    <Grid item xs={4} sm={2} key={preset.name}>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Box
                          onClick={() => handleColorChange(preset)}
                          sx={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '12px',
                            background: preset.gradient,
                            cursor: 'pointer',
                            border: avatarData.backgroundColor === preset.color ? '3px solid white' : 'none',
                            boxShadow: avatarData.backgroundColor === preset.color
                              ? `0 4px 20px ${preset.color}60`
                              : '0 2px 10px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Icon Selection */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                  Icon
                </Typography>
                <Grid container spacing={2}>
                  {iconOptions.map((icon) => (
                    <Grid item key={icon}>
                      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                        <IconButton
                          onClick={() => handleIconChange(icon)}
                          sx={{
                            width: 56,
                            height: 56,
                            fontSize: '1.5rem',
                            border: avatarData.icon === icon ? `3px solid ${avatarData.borderColor}` : 'none',
                            background: avatarData.icon === icon ? `${avatarData.borderColor}20` : 'transparent',
                            '&:hover': {
                              background: `${avatarData.borderColor}30`,
                            },
                          }}
                        >
                          {icon}
                        </IconButton>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Size Slider */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                  Size: {avatarData.size}px
                </Typography>
                <Slider
                  value={avatarData.size}
                  onChange={(e, value) => setAvatarData({ ...avatarData, size: value as number })}
                  min={60}
                  max={200}
                  step={10}
                  sx={{
                    '& .MuiSlider-thumb': {
                      background: avatarData.gradient,
                    },
                    '& .MuiSlider-track': {
                      background: avatarData.gradient,
                    },
                  }}
                />
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRandomize}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Randomize
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    flex: 1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    background: avatarData.gradient,
                    '&:hover': {
                      background: avatarData.gradient,
                      opacity: 0.9,
                    },
                  }}
                >
                  Save Avatar
                </Button>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AvatarCreator;
