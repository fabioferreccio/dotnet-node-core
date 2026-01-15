import {
    ServiceDescriptor,
    ServiceIdentifier,
    ImplementationFactory,
    Constructor,
} from "../DependencyInjection/ServiceDescriptor";
import { IServiceProvider } from "./IServiceProvider";

export interface IServiceCollection extends Array<ServiceDescriptor> {
    Add(descriptor: ServiceDescriptor): IServiceCollection;

    AddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    AddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    AddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;

    AddScoped<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    AddScoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;

    AddTransient<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    AddTransient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;

    TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): boolean;

    BuildServiceProvider(): IServiceProvider;
}
