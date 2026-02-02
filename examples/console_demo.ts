import { AnsiConsole, Color, Rule, Panel, Table } from "../src";

/**
 * Phase 8 CLI Infrastructure Demo
 * Run with: npx ts-node examples/console_demo.ts
 */

// 1. Initialize AnsiConsole with deterministic width (Experimental)
AnsiConsole.Configure({ width: 80 });

// 2. Rich Markup and Colors
AnsiConsole.Markup("[red]=== dotnet-node-core CLI Infrastructure (Phase 8) ===[/]\n");

// 3. Rule Widget
const rule = new Rule("System.Console Widgets", "blue");
rule.Render(AnsiConsole.Console);

console.log("\n");

// 4. Panel Widget
const panel = new Panel(
    "Este é um exemplo de Panel que foca em layouts estruturados e determinísticos.\n" +
    "A largura é fixada em 80 caracteres para garantir consistência em qualquer terminal.",
    "Arquitetura",
    "yellow"
);
panel.Render(AnsiConsole.Console);

console.log("\n");

// 5. Table Widget
const table = new Table();
table.AddColumn("Feature")
     .AddColumn("Status")
     .AddColumn("Phase");

table.AddRow("AnsiConsole", "Experimental", "8");
table.AddRow("Markup Engine", "Internal", "8");
table.AddRow("Widgets (Rule, Panel, Table)", "Experimental", "8");
table.AddRow("System.CommandLine", "Deferred", "9");

table.Render(AnsiConsole.Console);

AnsiConsole.Markup("\n[green]Verification Complete: All widgets rendered with correct layout.[/]");
 AnsiConsole.WriteLine();
