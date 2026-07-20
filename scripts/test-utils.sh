#!/bin/bash

# Test Maintenance Scripts
# سكريبتات صيانة الاختبارات

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to run all tests
run_all_tests() {
    echo "Running all tests..."
    pnpm vitest run
}

# Function to run unit tests only
run_unit_tests() {
    echo "Running unit tests..."
    pnpm vitest run --config vitest.config.ts
}

# Function to run E2E tests only
run_e2e_tests() {
    echo "Running E2E tests..."
    pnpm playwright test
}

# Function to run tests in watch mode
run_watch_tests() {
    echo "Running tests in watch mode..."
    pnpm vitest watch
}

# Function to run tests with coverage
run_coverage() {
    echo "Running tests with coverage..."
    pnpm vitest run --coverage
}

# Function to clean test results
clean_test_results() {
    echo "Cleaning test results..."
    rm -rf test-results
    rm -rf playwright-report
    rm -rf coverage
    print_success "Test results cleaned"
}

# Function to check test performance
check_performance() {
    echo "Checking test performance..."
    pnpm vitest run --reporter=verbose | grep -E "(Duration|Slow)"
}

# Function to find unused tests
find_unused_tests() {
    echo "Finding potentially unused tests..."
    find . -name "*.test.ts" -o -name "*.test.tsx" | head -20
}

# Function to check for flaky tests
check_flaky_tests() {
    echo "Checking for flaky tests (running 3 times)..."
    for i in {1..3}; do
        echo "Run $i..."
        pnpm vitest run
    done
}

# Function to update snapshots
update_snapshots() {
    echo "Updating snapshots..."
    pnpm vitest run -u
}

# Function to run specific test file
run_specific_test() {
    if [ -z "$1" ]; then
        print_error "Please provide a test file path"
        return 1
    fi
    echo "Running specific test: $1"
    pnpm vitest run "$1"
}

# Function to run tests in specific directory
run_directory_tests() {
    if [ -z "$1" ]; then
        print_error "Please provide a directory path"
        return 1
    fi
    echo "Running tests in directory: $1"
    pnpm vitest run "$1"
}

# Function to generate test report
generate_report() {
    echo "Generating test report..."
    pnpm vitest run --reporter=json > test-results/report.json
    print_success "Test report generated at test-results/report.json"
}

# Function to check test coverage threshold
check_coverage_threshold() {
    echo "Checking coverage threshold..."
    pnpm vitest run --coverage
    # Add logic to check if coverage meets threshold
}

# Function to run tests in CI mode
run_ci_tests() {
    echo "Running tests in CI mode..."
    pnpm vitest run --ci
    pnpm playwright test --ci
}

# Function to show test statistics
show_stats() {
    echo "Test Statistics:"
    echo "================"
    echo "Total test files:"
    find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" | wc -l
    echo "Total unit tests:"
    find . -path "*/node_modules" -prune -o -name "*.test.ts" -o -name "*.test.tsx" | wc -l
    echo "Total E2E tests:"
    find ./e2e -name "*.spec.ts" 2>/dev/null | wc -l
}

# Main menu
show_menu() {
    echo "Test Maintenance Scripts"
    echo "========================"
    echo "1. Run all tests"
    echo "2. Run unit tests only"
    echo "3. Run E2E tests only"
    echo "4. Run tests in watch mode"
    echo "5. Run tests with coverage"
    echo "6. Clean test results"
    echo "7. Check test performance"
    echo "8. Find unused tests"
    echo "9. Check for flaky tests"
    echo "10. Update snapshots"
    echo "11. Run specific test file"
    echo "12. Run tests in directory"
    echo "13. Generate test report"
    echo "14. Run tests in CI mode"
    echo "15. Show test statistics"
    echo "0. Exit"
    echo -n "Select an option: "
}

# Main script logic
if [ "$1" ]; then
    case $1 in
        "all") run_all_tests ;;
        "unit") run_unit_tests ;;
        "e2e") run_e2e_tests ;;
        "watch") run_watch_tests ;;
        "coverage") run_coverage ;;
        "clean") clean_test_results ;;
        "performance") check_performance ;;
        "unused") find_unused_tests ;;
        "flaky") check_flaky_tests ;;
        "snapshots") update_snapshots ;;
        "specific") run_specific_test "$2" ;;
        "directory") run_directory_tests "$2" ;;
        "report") generate_report ;;
        "ci") run_ci_tests ;;
        "stats") show_stats ;;
        *) print_error "Unknown command: $1" ;;
    esac
else
    while true; do
        show_menu
        read -r choice
        case $choice in
            1) run_all_tests ;;
            2) run_unit_tests ;;
            3) run_e2e_tests ;;
            4) run_watch_tests ;;
            5) run_coverage ;;
            6) clean_test_results ;;
            7) check_performance ;;
            8) find_unused_tests ;;
            9) check_flaky_tests ;;
            10) update_snapshots ;;
            11) 
                echo -n "Enter test file path: "
                read -r test_file
                run_specific_test "$test_file"
                ;;
            12)
                echo -n "Enter directory path: "
                read -r test_dir
                run_directory_tests "$test_dir"
                ;;
            13) generate_report ;;
            14) run_ci_tests ;;
            15) show_stats ;;
            0) exit 0 ;;
            *) print_error "Invalid option" ;;
        esac
        echo ""
        read -p "Press Enter to continue..."
        clear
    done
fi
