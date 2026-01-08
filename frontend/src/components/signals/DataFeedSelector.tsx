import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { minamService } from '../../services';
import { MinamFeed } from '../../types/signal';

interface DataFeedSelectorProps {
  selectedFeed1: MinamFeed | null;
  selectedFeed2: MinamFeed | null;
  onFeed1Change: (feed: MinamFeed | null) => void;
  onFeed2Change: (feed: MinamFeed | null) => void;
}

const DataFeedSelector: React.FC<DataFeedSelectorProps> = ({
  selectedFeed1,
  selectedFeed2,
  onFeed1Change,
  onFeed2Change,
}) => {
  const [feeds, setFeeds] = useState<MinamFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      const feedList = await minamService.listFeeds();
      setFeeds(feedList.filter(feed => feed.isActive));
    } catch (err: any) {
      setError(err.message || 'Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedSelect = (feed: MinamFeed, slot: 1 | 2) => {
    if (slot === 1) {
      if (selectedFeed2?.id === feed.id) {
        // Can't select same feed for both
        return;
      }
      onFeed1Change(feed);
    } else {
      if (selectedFeed1?.id === feed.id) {
        // Can't select same feed for both
        return;
      }
      onFeed2Change(feed);
    }
  };

  const handleFeedDeselect = (slot: 1 | 2) => {
    if (slot === 1) {
      onFeed1Change(null);
    } else {
      onFeed2Change(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Feed 1 {selectedFeed1 && `: ${selectedFeed1.name}`}
          </Typography>
          {selectedFeed1 && (
            <Button
              size="small"
              onClick={() => handleFeedDeselect(1)}
              sx={{ mt: 1 }}
            >
              Clear
            </Button>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Feed 2 {selectedFeed2 && `: ${selectedFeed2.name}`}
          </Typography>
          {selectedFeed2 && (
            <Button
              size="small"
              onClick={() => handleFeedDeselect(2)}
              sx={{ mt: 1 }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>


      <Grid container spacing={2}>
        {feeds.map((feed) => {
          const isSelected1 = selectedFeed1?.id === feed.id;
          const isSelected2 = selectedFeed2?.id === feed.id;
          const isSelected = isSelected1 || isSelected2;
          const isDisabled = (selectedFeed1 && !isSelected1 && selectedFeed2) || 
                            (selectedFeed2 && !isSelected2 && selectedFeed1);

          return (
            <Grid item xs={12} sm={6} md={4} key={feed.id}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  sx={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    backgroundColor: isSelected ? 'action.selected' : 'background.paper',
                  }}
                  onClick={() => {
                    if (!isDisabled) {
                      if (!selectedFeed1) {
                        handleFeedSelect(feed, 1);
                      } else if (!selectedFeed2) {
                        handleFeedSelect(feed, 2);
                      } else if (isSelected1) {
                        handleFeedDeselect(1);
                      } else if (isSelected2) {
                        handleFeedDeselect(2);
                      }
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {feed.name}
                      </Typography>
                      {isSelected && (
                        <Chip
                          label={isSelected1 ? 'Feed 1' : 'Feed 2'}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                    <Chip
                      label={feed.type}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {feed.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Update: {feed.updateFrequency} | Provider: {feed.provider}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DataFeedSelector;
