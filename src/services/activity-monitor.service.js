/**
 * Activity Monitor Service
 * Monitors devices, gateways, and nodes for inactivity
 * Automatically marks them as offline after 5 minutes of no data
 */

const logger = require('../utils/logger');
const dbService = require('./database.service');

class ActivityMonitorService {
  constructor() {
    this.checkInterval = null;
    this.inactivityTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Start monitoring activity
   */
  start() {
    logger.info('[Activity Monitor] Starting activity monitor...');
    
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkInactivity();
    }, 60 * 1000); // Check every 1 minute

    // Initial check
    this.checkInactivity();
    
    logger.info('[Activity Monitor] Activity monitor started (5 min timeout)');
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('[Activity Monitor] Activity monitor stopped');
    }
  }

  /**
   * Check for inactive devices, gateways, and nodes
   */
  async checkInactivity() {
    try {
      const now = new Date();
      const inactiveThreshold = new Date(now.getTime() - this.inactivityTimeout);

      // Check devices
      await this.checkDevices(inactiveThreshold);

      // Check gateways
      await this.checkGateways(inactiveThreshold);

      // Check nodes
      await this.checkNodes(inactiveThreshold);

    } catch (error) {
      logger.error('[Activity Monitor] Error checking inactivity:', error);
    }
  }

  /**
   * Check device activity
   */
  async checkDevices(inactiveThreshold) {
    try {
      const devices = await dbService.getAllDevices(1000);
      
      for (const device of devices) {
        if (device.status !== 'online' && device.status !== 'active') continue;
        
        const lastSeen = new Date(device.last_seen);
        
        if (lastSeen < inactiveThreshold) {
          // Mark as offline
          await dbService.updateDeviceStatus(device.device_id, 'offline');
          
          // Log the event
          await dbService.insertLog(
            'device',
            `Device marked offline due to inactivity (last seen: ${device.last_seen})`,
            null,
            device.device_id
          );
          
          logger.warn(`[Activity Monitor] Device ${device.device_id} marked OFFLINE (inactive for 5+ minutes)`);
        }
      }
    } catch (error) {
      logger.error('[Activity Monitor] Error checking devices:', error);
    }
  }

  /**
   * Check gateway activity
   */
  async checkGateways(inactiveThreshold) {
    try {
      const gateways = await dbService.getAllGateways(1000);
      
      for (const gateway of gateways) {
        if (gateway.status !== 'online' && gateway.status !== 'active') continue;
        
        const lastSeen = new Date(gateway.last_seen);
        
        if (lastSeen < inactiveThreshold) {
          // Mark as offline
          await dbService.updateGatewayStatus(gateway.gateway_id, 'offline');
          
          // Log the event
          await dbService.insertLog(
            'gateway',
            `Gateway marked offline due to inactivity (last seen: ${gateway.last_seen})`,
            null,
            gateway.gateway_id
          );
          
          logger.warn(`[Activity Monitor] Gateway ${gateway.gateway_id} marked OFFLINE (inactive for 5+ minutes)`);
        }
      }
    } catch (error) {
      logger.error('[Activity Monitor] Error checking gateways:', error);
    }
  }

  /**
   * Check node activity
   */
  async checkNodes(inactiveThreshold) {
    try {
      const nodes = await dbService.getAllNodes(1000);
      
      for (const node of nodes) {
        const lastSeen = new Date(node.last_seen);
        
        if (lastSeen < inactiveThreshold) {
          // Note: MongoDB service doesn't have updateNode, nodes are updated via updateNodeStatus
          // For now, just log - nodes don't have explicit status field
          
          // Log the event
          await dbService.insertLog(
            'node',
            `Node ${node.node_name || node.mac} inactive (last seen: ${node.last_seen})`,
            null,
            node.mac
          );
          
          logger.warn(`[Activity Monitor] Node ${node.node_name || node.mac} INACTIVE (inactive for 5+ minutes)`);
        }
      }
    } catch (error) {
      logger.error('[Activity Monitor] Error checking nodes:', error);
    }
  }
}

// Export singleton instance
module.exports = new ActivityMonitorService();
