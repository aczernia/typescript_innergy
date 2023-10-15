export type ServiceYear = 2020 | 2021 | 2022 | "default";
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

export type RequiredServiceType = {
    [Key in ServiceType]?: ServiceType[]
}

export type PriceListType = {
    [Key in ServiceType]?: {[Key in ServiceYear]?}
}

export type ServieTypePriceSummary = {
    basePrice: number;
    discounts: number;
}

export const priceList: PriceListType = {
    Photography: {
        "2020": {
            price: 1700,
            discounts: {
                VideoRecording: {
                    price: 2200
                }
            }
        },
        "2021": {
            price: 1800,
            discounts: {
                VideoRecording: {
                    price: 2300
                }
            }
        },
        "2022": {
            price: 1900,
            discounts: {
                VideoRecording: {
                    price: 2500
                }
            }
        }
    },
    VideoRecording: {
        "2020": {
            price: 1700,
            discounts: {
                Photography: {
                    price: 0
                }
            }
        },
        "2021": {
            price: 1800,
            discounts: {
                Photography: {
                    price: 0
                }
            }
        },
        "2022": {
            price: 1900,
            discounts: {
                Photography: {
                    price: 0
                }
            }
        }
    },
    WeddingSession: {
        "2022": {
            price: 1700,
            discounts: {
                Photography: {
                    price: 0
                }
            }
        },
        default: {
            price: 1700,
        },
    },
    BlurayPackage: {
        default: {
            price: 300,
        },
    },
    TwoDayEvent: {
        default: {
            price: 400,
        },
    }
}


export const requiredServices: RequiredServiceType = {
    BlurayPackage: ["VideoRecording", "WeddingSession"],
    TwoDayEvent: ["VideoRecording", "Photography"]
}

export const checkRequiredServices = (selectedService: ServiceType, currentSelectedServices: ServiceType[]): boolean => {
    const requiredServicesForSelectedService = requiredServices[selectedService] ?? [];
    if(!requiredServicesForSelectedService.length){
        return true;
    }
    requiredServicesForSelectedService.forEach((requiredServices) => {
        if (currentSelectedServices.includes(requiredServices)) 
            return true;
    })

    return false;
}

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
) => {
    switch(action.type) {
        case "Select":
            if(previouslySelectedServices.includes(action.service)){
                return previouslySelectedServices;
            }
            if(checkRequiredServices(action.service, previouslySelectedServices)){
                return previouslySelectedServices;
            }
            return [
                ...previouslySelectedServices,
                action.service
            ]
        case "Deselect":
            return [
                ...previouslySelectedServices.filter(a => a !== action.service)
            ]
        default:
            return previouslySelectedServices;
    }
}

export const calculateBasePriceForSelectedService = (currentCalculatedService: ServiceType, selectedServices: ServiceType[], selectedYear: ServiceYear): ServieTypePriceSummary => {
    const servicePriceList = priceList[currentCalculatedService];
        const servicePriceForSelectedYear = servicePriceList[selectedYear]
        if(servicePriceForSelectedYear){
            return servicePriceForSelectedYear.price;
        }

        const defaultServicePriceList = servicePriceList["default"];

        return {
            basePrice: defaultServicePriceList.price,
            discounts: defaultServicePriceList.price
        };
}


export const calculateBasePriceForSelectedServices = (selectedServices: ServiceType[], selectedYear: ServiceYear): number => {
    let basePrice = 0;
    selectedServices.forEach((service) => {
        basePrice += calculateBasePriceForSelectedService(service, selectedServices, selectedYear).basePrice
    })

    return basePrice;
}


export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => ({ basePrice: calculateBasePriceForSelectedServices(selectedServices, selectedYear), finalPrice: calculateBasePriceForSelectedServices(selectedServices, selectedYear) });