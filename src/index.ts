export const DEFAULT_PRICELIST = 0;

export type ServiceYear = 2020 | 2021 | 2022 | typeof DEFAULT_PRICELIST;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

export type RequiredServiceType = {
    [Key in ServiceType]?: ServiceType[]
}

export type ServiceTypePriceSummary = {
    basePrice: number;
    finalPrice: number;
}

export type PriceListInfo = {
    price?: number;
    discounts?: PriceListDiscountInfo
}

export type PriceListDiscountInfo = {
    [Key in ServiceType]?: PriceListInfo
}

export type PriceListType = {
    [Key in ServiceType]?: { [Key in ServiceYear]?: PriceListInfo }
}

export const requiredServices: RequiredServiceType = {
    BlurayPackage: ["VideoRecording"],
    TwoDayEvent: ["Photography", "VideoRecording"],
}

export const priceList: PriceListType = {
    Photography: {
        2020: {
            price: 1700,
        },
        2021: {
            price: 1800,
        },
        2022: {
            price: 1900,
        }
    },
    VideoRecording: {
        2020: {
            price: 1700,
            discounts: {
                Photography: {
                    price: 500
                }
            }
        },
        2021: {
            price: 1800,
            discounts: {
                Photography: {
                    price: 500
                }
            }
        },
        2022: {
            price: 1900,
            discounts: {
                Photography: {
                    price: 600
                }
            }
        }
    },
    WeddingSession: {
        2022: {
            price: 600,
            discounts: {
                Photography: {
                    price: 0
                },
                VideoRecording: {
                    price: 300
                }
            }
        },
        0: {
            price: 600,
            discounts: {
                Photography: {
                    price: 300
                },
                VideoRecording: {
                    price: 300
                }
            }
        },
    },
    BlurayPackage: {
        0: {
            price: 300,
        },
    },
    TwoDayEvent: {
        0: {
            price: 400,
        },
    }
}

export const checkRequiredServices = (selectedService: ServiceType, currentSelectedServices: ServiceType[]): boolean => {
    const requiredServicesForSelectedService = requiredServices[selectedService] ?? [];
    if (!requiredServicesForSelectedService.length) {
        return true;
    }

    let hasRequiredService = false;

    currentSelectedServices.forEach((currentSelectedService) => {
        if(requiredServicesForSelectedService.includes(currentSelectedService)){
            hasRequiredService = true;
        }
    })

    return hasRequiredService;
}

export const calculatePriceForSelectedService = (
    currentCalculatedService: ServiceType, 
    selectedServices: ServiceType[], 
    selectedYear: ServiceYear): ServiceTypePriceSummary => {
        
    if(!checkRequiredServices(currentCalculatedService, selectedServices)){
        return {
            basePrice: 0,
            finalPrice: 0
        };
    }

    let basePrice = 0;
    let discountPrice = 0;

    const servicePriceList = priceList[currentCalculatedService];
    const servicePriceListForSelectedYear = servicePriceList[selectedYear];

    if (servicePriceListForSelectedYear) {
        let basePrice = servicePriceListForSelectedYear.price;
        discountPrice = basePrice;
        if (servicePriceListForSelectedYear.discounts) {
            selectedServices.forEach((selectedService) => {
                if(servicePriceListForSelectedYear.discounts[selectedService] && servicePriceListForSelectedYear.discounts[selectedService].price < discountPrice){
                    discountPrice = servicePriceListForSelectedYear.discounts[selectedService].price;
                }
            })
        }
        
        return {
            basePrice: basePrice,
            finalPrice: discountPrice
        };
    }

    const defaultServicePriceList = servicePriceList[DEFAULT_PRICELIST];
    
    basePrice = defaultServicePriceList.price;
    discountPrice = basePrice;

    if (defaultServicePriceList.discounts) {
        selectedServices.forEach((s) => {
            if(defaultServicePriceList.discounts[s] && defaultServicePriceList.discounts[s].price < discountPrice){
                discountPrice = defaultServicePriceList.discounts[s].price;
            }
        })
    }

    return {
        basePrice: basePrice,
        finalPrice: discountPrice
    };
}

export const calculatePriceForSelectedServices = (selectedServices: ServiceType[], selectedYear: ServiceYear): any => {
    let basePrice = 0;
    let finalPrice = 0;
    
    selectedServices.forEach((service) => {
        basePrice += calculatePriceForSelectedService(service, selectedServices, selectedYear).basePrice
        finalPrice += calculatePriceForSelectedService(service, selectedServices, selectedYear).finalPrice
    })

    if(finalPrice === 0){
        finalPrice = basePrice;
    }

    return {
        basePrice: basePrice,
        finalPrice: finalPrice
    };
}


export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => { 
    const prices = calculatePriceForSelectedServices(selectedServices, selectedYear);
    return {
        basePrice: prices.basePrice, 
        finalPrice: prices.finalPrice 
    }
}

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
) => {
    switch (action.type) {
        case "Select":
            if (previouslySelectedServices.includes(action.service)) {
                return previouslySelectedServices;
            }

            if (!checkRequiredServices(action.service, previouslySelectedServices)) {
                return previouslySelectedServices;
            }

            return [
                ...previouslySelectedServices,
                action.service
            ]
        case "Deselect":
            let servicesWithoutDeselectedService = previouslySelectedServices.filter(previouslySelectedService => previouslySelectedService !== action.service);
            servicesWithoutDeselectedService.forEach((checkedService) => {
                if(!checkRequiredServices(checkedService, servicesWithoutDeselectedService)){
                    servicesWithoutDeselectedService = servicesWithoutDeselectedService.filter(service => service !== checkedService)
                }
            })
            
            return [
                ...servicesWithoutDeselectedService
            ]
        default:
            return previouslySelectedServices;
    }
}