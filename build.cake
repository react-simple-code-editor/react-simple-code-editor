var target = Argument("target", "Default");
var configuration = Argument("configuration", "Debug");
var TestResultsDirectory = Argument("TestResultsDirectory", "./");
var restore=Task("Restore-Packages")
    .Does(() =>
    {
        Information("Starting Restore");
        var settings = new DotNetCoreRestoreSettings
        {
            Verbosity = DotNetCoreVerbosity.Minimal,
            Interactive = true
        };
        DotNetCoreRestore(settings);
        Information("Ending Restore");
    });

var build = Task("Build")
    .Does(()=>
    {
        Information("Starting Build");
        var settings = new DotNetCoreMSBuildSettings();
        DotNetCoreMSBuild(settings.SetConfiguration(configuration));
        Information("Ending Build");
    });

var tests = Task("Tests")
    .Does(()=>
    {
        Information("Starting Tests");
        var settings = new DotNetCoreTestSettings
        {
            Configuration = configuration,
            NoRestore = true,
            NoBuild = true,
            ArgumentCustomization = args=>args.Append(@"/p:CollectCoverage=true")
                                            .Append(@"/p:CoverletOutputFormat=cobertura")
                                            .Append(@"/p:CoverletOutput="+TestResultsDirectory+@"\coverage.xml")
        };
        DotNetCoreTest("",settings);
        Information("Ending Tests");
    });


var packageNuspecFile = Task("Package")
    .Does(()=>
    {
        Information("Starting Package");
        var settings = new DotNetCorePackSettings
        {
            Configuration = configuration,
            NoRestore = true,
            NoBuild = true,
            Verbosity = DotNetCoreVerbosity.Normal,
            OutputDirectory = "./artifacts/"
        };
        DotNetCorePack("./",settings);
        Information("Ending Package");
    });

var fullRun = Task("FullRun")
    .IsDependentOn("Restore-Packages")
    .IsDependentOn("Build")
    .IsDependentOn("Tests")
    .IsDependentOn("Package");

Task("Default")
    .IsDependentOn("FullRun");

RunTarget(target);
