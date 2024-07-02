import axios from 'axios'

export class FlashingHistoryService{

    /**
     * @param {string} customerId 
     * @returns {Promise<any[]>}
     */
    static async GetCustomerHistory(customerId){
        const { data } = await axios.get(`/admin/customer-info/flashing-history/${customerId}`)
        return (data && data.flashingHistory) || []
    }

}