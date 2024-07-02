export function getCustomDbName(email, vin){
    return vin.toUpperCase() + email.toLowerCase().split('.')[0]
}