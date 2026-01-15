import { ServiceDescriptor, ServiceIdentifier, ImplementationFactory } from "../DependencyInjection/ServiceDescriptor";
import { IServiceProvider } from "./IServiceProvider";

export interface IServiceCollection extends Array<ServiceDescriptor> {
    Add(descriptor: ServiceDescriptor): IServiceCollection;

    AddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: { new (...args: any[]): T }): IServiceCollection;
    AddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    AddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;

    AddScoped<T>(serviceType: ServiceIdentifier<T>, implementation: { new (...args: any[]): T }): IServiceCollection;
    AddScoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;

    AddTransient<T>(serviceType: ServiceIdentifier<T>, implementation: { new (...args: any[]): T }): IServiceCollection;
    AddTransient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;

    TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: { new (...args: any[]): T }): boolean;

    BuildServiceProvider(): IServiceProvider;
}
