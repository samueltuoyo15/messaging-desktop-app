import React from 'react';
import { useAppSelector } from '../store/hooks';
import { ConnectionStatus as Status } from '../store/connectionSlice';
import './ConnectionStatus.css';

export const ConnectionStatus: React.FC<{ onSimulateDisconnect: () => void }> = ({
    onSimulateDisconnect
}) => {
    const status = useAppSelector(state => state.connection.status);
    const reconnectAttempts = useAppSelector(state => state.connection.reconnectAttempts);

    const getStatusColor = (status: Status) => {
        switch (status) {
            case 'connected':
                return '#4caf50';
            case 'reconnecting':
                return '#ff9800';
            case 'offline':
                return '#f44336';
        }
    };

    const getStatusText = (status: Status) => {
        switch (status) {
            case 'connected':
                return 'Connected';
            case 'reconnecting':
                return `Reconnecting${reconnectAttempts > 0 ? ` (${reconnectAttempts})` : ''}`;
            case 'offline':
                return 'Offline';
        }
    };

    return (
        <div className="connection-status">
            <div className="status-indicator">
                <div
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(status) }}
                />
                <span className="status-text">{getStatusText(status)}</span>
            </div>
            <button
                className="simulate-btn"
                onClick={onSimulateDisconnect}
                disabled={status === 'offline'}
            >
                Simulate Disconnect
            </button>
        </div>
    );
};
