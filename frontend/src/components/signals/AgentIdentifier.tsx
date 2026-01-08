import React from 'react';
import {
  Box,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { SignalCreator } from '../../types/signal';

interface AgentIdentifierProps {
  creator: SignalCreator;
  onChange: (creator: SignalCreator) => void;
}

const AgentIdentifier: React.FC<AgentIdentifierProps> = ({ creator, onChange }) => {
  const handleTypeChange = (isAgent: boolean) => {
    onChange({
      ...creator,
      type: isAgent ? 'agent' : 'human',
      isAgentAnnounced: isAgent ? true : false, // Agents must announce
    });
  };

  const handleNameChange = (name: string) => {
    onChange({
      ...creator,
      name,
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Creator Information
      </Typography>
      
      <FormControlLabel
        control={
          <Checkbox
            checked={creator.type === 'agent'}
            onChange={(e) => handleTypeChange(e.target.checked)}
          />
        }
        label="I am an AI Agent"
      />

      {creator.type === 'agent' && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            ⚠️ Agents must announce they are agents. This is automatically set.
          </Typography>
        </Box>
      )}

      <TextField
        fullWidth
        label="Creator Name (Optional)"
        value={creator.name || ''}
        onChange={(e) => handleNameChange(e.target.value)}
        sx={{ mt: 2 }}
        placeholder={creator.type === 'agent' ? 'Agent Name' : 'Your Name'}
      />
    </Paper>
  );
};

export default AgentIdentifier;
