const { Vault, TokenType } = require('../models/vault');
const auditLogger = require('./auditLogger');

class VestingService {
  /**
   * Create a new vault
   * 
   * Supports two calling patterns for backward compatibility:
   * 1. Individual parameters: createVault(adminAddress, vaultAddress, ownerAddress, ...)
   * 2. Object parameter: createVault({ address, owner_address, token_address, ... })
   * 
   * @param {string|Object} adminAddressOrData - Admin address or vault data object
   * @param {string} vaultAddress - Vault contract address (if using individual params)
   * @param {string} ownerAddress - Owner address (if using individual params)
   * @param {string} tokenAddress - Token contract address (if using individual params)
   * @param {string|number} totalAmount - Total amount of tokens (if using individual params)
   * @param {Date|string} startDate - Vesting start date (if using individual params)
   * @param {Date|string} endDate - Vesting end date (if using individual params)
   * @param {Date|string|null} cliffDate - Optional cliff date (if using individual params)
   * @param {string} tokenType - Token type: 'static' (default) or 'dynamic' (if using individual params)
   * @returns {Promise<Object>} Created vault object
   */
  async createVault(
    adminAddressOrData,
    vaultAddress,
    ownerAddress,
    tokenAddress,
    totalAmount,
    startDate,
    endDate,
    cliffDate = null,
    tokenType = 'static'
  ) {
    try {
      let vaultData;
      let adminAddress;

      // Check if first parameter is an object (object-based call)
      if (typeof adminAddressOrData === 'object' && adminAddressOrData !== null) {
        // Object-based call pattern
        vaultData = adminAddressOrData;
        adminAddress = vaultData.adminAddress || 'system';
        
        // Validate token type if provided
        if (vaultData.token_type && !['static', 'dynamic'].includes(vaultData.token_type)) {
          throw new Error(`Invalid token type: ${vaultData.token_type}. Must be 'static' or 'dynamic'`);
        }

        // Create vault with token_type from object
        const vault = await Vault.create({
          address: vaultData.address,
          name: vaultData.name,
          owner_address: vaultData.owner_address,
          token_address: vaultData.token_address,
          total_amount: vaultData.initial_amount || vaultData.total_amount || 0,
          token_type: vaultData.token_type || 'static', // Default to 'static' for backward compatibility
          tag: vaultData.tag,
          org_id: vaultData.org_id
        });

        // Log the action for audit
        auditLogger.logAction(adminAddress, 'CREATE_VAULT', vault.address, {
          ownerAddress: vault.owner_address,
          tokenAddress: vault.token_address,
          totalAmount: vault.total_amount,
          tokenType: vault.token_type,
          name: vault.name,
          tag: vault.tag
        });

        return vault;
      } else {
        // Individual parameter call pattern
        adminAddress = adminAddressOrData;
        
        // Validate token type
        if (tokenType && !['static', 'dynamic'].includes(tokenType)) {
          throw new Error(`Invalid token type: ${tokenType}. Must be 'static' or 'dynamic'`);
        }

        // Create vault with token_type
        const vault = await Vault.create({
          address: vaultAddress,
          owner_address: ownerAddress,
          token_address: tokenAddress,
          total_amount: totalAmount || 0,
          token_type: tokenType || 'static', // Default to 'static' for backward compatibility
        });

        // Log the action for audit
        auditLogger.logAction(adminAddress, 'CREATE_VAULT', vaultAddress, {
          ownerAddress,
          tokenAddress,
          totalAmount,
          tokenType: vault.token_type,
          startDate,
          endDate,
          cliffDate
        });

        return {
          success: true,
          message: 'Vault created successfully',
          vault: {
            id: vault.id,
            address: vault.address,
            owner_address: vault.owner_address,
            token_address: vault.token_address,
            total_amount: vault.total_amount,
            token_type: vault.token_type,
            created_at: vault.created_at
          },
          adminAddress,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error in createVault:', error);
      throw error;
    }
  }
}

module.exports = new VestingService();
