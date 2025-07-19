import React, { useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography, Button, Alert } from '@mui/material';
import { ShowChart as ShowChartIcon } from '@mui/icons-material';

interface TradingViewWidgetProps {
  symbol: string;
  interval?: string;
  theme?: 'light' | 'dark';
  style?: '1' | '2' | '3';
  width?: string | number;
  height?: string | number;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  interval = '15',
  theme = 'light',
  style = '1',
  width = '100%',
  height = 400
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Load TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = createWidget;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, interval, theme, style]);

  const createWidget = () => {
    if (containerRef.current && window.TradingView) {
      widgetRef.current = new window.TradingView.widget({
        symbol: symbol,
        interval: interval,
        timezone: 'Etc/UTC',
        theme: theme,
        style: style,
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: containerRef.current.id,
        width: width,
        height: height,
        studies: [
          'RSI@tv-basicstudies',
          'MACD@tv-basicstudies',
          'BB@tv-basicstudies'
        ],
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
        disabled_features: [
          'use_localstorage_for_settings',
          'volume_force_overlay'
        ],
        enabled_features: [
          'study_templates',
          'side_toolbar_in_fullscreen_mode'
        ],
        overrides: {
          'mainSeriesProperties.candleStyle.upColor': '#26a69a',
          'mainSeriesProperties.candleStyle.downColor': '#ef5350',
          'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350'
        },
        loading_screen: {
          backgroundColor: '#ffffff',
          foregroundColor: '#000000'
        }
      });
    }
  };

  const openInTradingView = () => {
    const url = `https://www.tradingview.com/chart/?symbol=${symbol}`;
    window.open(url, '_blank');
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShowChartIcon color="primary" />
            <Typography variant="h6">
              Technical Analysis - {symbol}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={openInTradingView}
            startIcon={<ShowChartIcon />}
          >
            Open in TradingView
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Interactive chart with RSI, MACD, and Bollinger Bands. Use this for technical analysis to complement your sentiment analysis.
          </Typography>
        </Alert>

        <Box
          id={`tradingview-widget-${symbol}`}
          ref={containerRef}
          sx={{
            width: '100%',
            height: height,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        />
      </CardContent>
    </Card>
  );
};

export default TradingViewWidget; 