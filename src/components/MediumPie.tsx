import React from 'react';
import { ResponsivePie } from '@nivo/pie';

type Props = {
  data: Array<any>,
  scheme?: string,
  totalFormat?: number => string
};

export default function MediumPie(props: Props) {
  const { data, scheme, totalFormat } = props;

  const total = data.reduce((a, b) => a + (b.value || 0), 0);

  const margin = { top: 0, right: 85, bottom: 0, left: 0 };

  const styles = {
    root: {
      fontFamily: 'consolas, sans-serif',
      textAlign: 'center',
      position: 'relative',
      width: 250,
      height: 100,
      margin: '10px 0 10px 0'
    },
    overlay: {
      position: 'absolute',
      top: 0,
      right: margin.right,
      bottom: 0,
      left: margin.left,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      color: '#000',
      // background: "#FFFFFF33",
      textAlign: 'center',
      // This is important to preserve the chart interactivity
      pointerEvents: 'none'
    },
    totalLabel: {
      fontSize: 12
    }
  };

  const theme = {
    background: '#FFF',
    axis: {
      fontSize: '14px',
      tickColor: '#000',
      ticks: {
        line: {
          stroke: '#555555'
        },
        text: {
          fill: '#000'
        }
      },
      legend: {
        text: {
          fill: '#000'
        }
      }
    },
    grid: {
      line: {
        stroke: '#555555'
      }
    }
  };

  const legends = [
    {
      anchor: 'right',
      direction: 'column',
      justify: false,
      translateX: 140,
      translateY: 0,
      itemsSpacing: 2,
      itemWidth: 150,
      itemHeight: 14,
      itemOpacity: 0.85,
      itemTextColor: '#999',
      symbolSize: 12,
      symbolShape: 'circle',
      effects: [
        {
          on: 'hover',
          style: {
            itemOpacity: 1
          }
        }
      ]
    }
  ];

  return (
    <div style={styles.root}>
      <ResponsivePie
        margin={margin}
        data={data}
        colors={{ scheme }}
        innerRadius={0.6}
        enableRadialLabels={false}
        enableSlicesLabels={false}
        theme={theme}
        legends={legends}
        animate
        motionStiffness={90}
        motionDamping={15}
        isInteractive
        onMouseEnter={(_data, event) => {
          // eslint-disable-next-line no-param-reassign
          event.target.style.cursor = 'currentDur';
        }}
        onMouseLeave={(_data, event) => {
          // eslint-disable-next-line no-param-reassign
          event.target.style.cursor = 'cursor';
        }}
      />
      <div style={styles.overlay}>
        <span>{totalFormat(total)}</span>
      </div>
    </div>
  );
}
MediumPie.defaultProps = {
  scheme: 'nivo',
  totalFormat: val => `${val}`
};
