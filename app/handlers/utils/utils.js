module.exports = {
    // 验证参数规则
    validationParams: function(req, rule, callback) {
        let params = req.params;
        for (let i = 0; i < rule.length; i++) {
            if (i >= params.length) {
                if (rule[i].value == null) {
                    let error = {code: -32602, message: rule[i].name+' is required'};
                    callback(error, undefined);
                    return false;
                }
                continue;
            }

            if (!rule[i].is_valid(params[i].toString())) {
                let error = {code: -32602, message: rule[i].name+' is invalid param'};
                callback(error, undefined);
                return false;
            }
        }
        return true;
    },

    // 获取热钱包地址
    getHotAddress: async function(client) {
        const addresses = await client.getAddressesByAccount('hot');
        if (addresses.length == 0) {
            const address = await client.getAccountAddress('hot');
            return [address];
        }
        return addresses[0];
    },

    // 获取付款钱包地址
    getPaymentAddresses: async function(client) {
        return await client.getAddressesByAccount('payment');
    },

    // 获取未消费输出
    getUnspentByAddresses: async function (client, addresses, minBalance) {
        let array = new Array();
        const listunspent = await client.listUnspent(1, 999999999, addresses);
        for (const index in listunspent) {
            const unspent = listunspent[index];
            if (!minBalance) {
                array.push(unspent);
            } else if (unspent.amount >= minBalance) {
                array.push(unspent);
            }
        }
        return array;
    },

    // 获取Omni代币余额
    getOmniWalletBalances: async function (client, propertyid) {
        let balances = new Map();
        const array = await client.omni_getWalletAddressBalances();
        for (let idx in array) {
            const address = array[idx];
            for (let idx in address.balances) {
                const balance = address.balances[idx];
                if (balance.propertyid == propertyid) {
                    balances.set(address.address, balance.balance);
                    break;
                }
            }
        }
        return balances;
    },

    // 过滤拥有Omni余额的未消费输出
    filterUnspentWithOmniBalacne: async function (client, listunspent, propertyid) {
        let array = new Array();
        const balances = await this.getOmniWalletBalances(client, propertyid);
        for (let idx in listunspent) {
            const unspent = listunspent[idx];
            if (!balances.has(unspent.address)) {
                array.push(unspent);
            }
        }
        return array;
    }
};