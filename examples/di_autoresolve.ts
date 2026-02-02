import "reflect-metadata";
import { ServiceCollection } from "../src/System/DependencyInjection/ServiceCollection";
import { Injectable } from "../src/Domain/DependencyInjection/Injectable";

// 1. Define Dependencies
@Injectable()
class Logger {
    log(msg: string) {
        console.log(`[Logger]: ${msg}`);
    }
}

// 2. Define Service with Auto-Resolution
@Injectable()
class UserService {
    constructor(private readonly logger: Logger) {}

    greet(name: string) {
        this.logger.log(`Hello, ${name}!`);
    }
}

// 3. Define Interface/Token Binding
abstract class IFileService {
    abstract read(): void;
}

@Injectable()
class FileService extends IFileService {
    constructor(private readonly logger: Logger) {
        super();
    }
    read() {
        this.logger.log("Reading file...");
    }
}

// 4. Test Logic
function run() {
    console.log("--- DI Auto-Resolution Test ---");
    
    const services = new ServiceCollection();

    // Register Logger (Dependencies)
    services.AddSingleton(Logger);

    // Register UserService (Auto-Resolve -> Logger)
    services.AddTransient(UserService);

    // Register FileService (Token Binding + Auto-Resolve -> Logger)
    services.AddTransient(IFileService, FileService);

    const provider = services.BuildServiceProvider();

    console.log("1. Resolving UserService...");
    const userService = provider.GetRequiredService(UserService);
    userService.greet("User");

    console.log("2. Resolving IFileService...");
    const fileService = provider.GetRequiredService(IFileService);
    fileService.read();

    console.log("--- SUCCESS ---");
}

run();
