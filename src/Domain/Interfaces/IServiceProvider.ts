import { ServiceIdentifier } from "../DependencyInjection/ServiceDescriptor";

export interface IServiceProvider {
    /**
     * Gets the service object of the specified type.
     * @param serviceIdentifier The type or identifier of the service to get.
     * @returns A service object of type T or null if there is no service object of type T.
     */
    GetService<T>(serviceIdentifier: ServiceIdentifier<T>): T | null;

    /**
     * Gets service of type T from the IServiceProvider.
     * Throws an exception if the service is not found.
     * @param serviceIdentifier The type or identifier of the service to get.
     * @returns A service object of type T.
     */
    GetRequiredService<T>(serviceIdentifier: ServiceIdentifier<T>): T;
}
