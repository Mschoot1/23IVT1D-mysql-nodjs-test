var gulp = require('gulp');
var sonarqubeScanner = require('sonarqube-scanner');
var runSequence = require('run-sequence');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task('sonarqube', ['test'], function(callback) {
    sonarqubeScanner({
        serverUrl: "https://sonarqube.com",
        options: {
            "sonar.organization": "mschoot1-github",
            "sonar.projectKey": "mschoot1-github:feature",
            "sonar.login": "34dde1dd7e947f39baf6329cd8012f3dae24464b",
            "sonar.projectName": "Programmeren-4-opdracht-server",
            "sonar.working.directory": "./.sonar",
            "sonar.tests": "test",
            "sonar.javascript.lcov.reportPath": "coverage/lcov.info",
            "sonar.exclusions": "gulpfile.js, .gitignore, *.md, *.yml, *.sql, *.txt, *.json, node_modules/**, coverage/**, test/**",
            "sonar.verbose": "true"
        }
    }, callback);
});

gulp.task('test', ['pre-test'], function() {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha())
        // Creating the reports after tests ran
        .pipe(istanbul.writeReports());
});

gulp.task('pre-test', function() {
    return gulp.src(['*.js', 'api/**/*.js', 'auth/**/*.js', 'config/**/*.js'])
        // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
});

gulp.task('default', function() {
    runSequence('sonarqube');
});