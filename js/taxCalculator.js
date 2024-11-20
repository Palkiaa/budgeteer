export class TaxCalculator {
    static TAX_BRACKETS = [
        { min: 0, max: 237100, rate: 0.18, base: 0 },
        { min: 237101, max: 370500, rate: 0.26, base: 42678 },
        { min: 370501, max: 512800, rate: 0.31, base: 77362 },
        { min: 512801, max: 673000, rate: 0.36, base: 121475 },
        { min: 673001, max: 857900, rate: 0.39, base: 179147 },
        { min: 857901, max: 1817000, rate: 0.41, base: 251258 },
        { min: 1817001, max: Infinity, rate: 0.45, base: 644489 }
    ];

    static TAX_THRESHOLDS = {
        under65: 95750,
        under75: 148217,
        over75: 165689
    };

    static PRIMARY_REBATE = 17235;
    static SECONDARY_REBATE = 9444;  // Age 65-74
    static TERTIARY_REBATE = 3145;   // Age 75+
    static UIF_CAP = 177.12;

    static calculateAnnualTax(annualTaxableIncome, age) {
        // Find applicable tax bracket
        const bracket = this.TAX_BRACKETS.find(bracket => 
            annualTaxableIncome > bracket.min && annualTaxableIncome <= bracket.max
        ) || this.TAX_BRACKETS[0];

        // Calculate annual tax
        const taxableAmount = annualTaxableIncome - bracket.min;
        const annualTax = bracket.base + (bracket.rate * taxableAmount);

        // Calculate rebates based on age
        let totalRebate = this.PRIMARY_REBATE;
        if (age >= 65 && age < 75) {
            totalRebate += this.SECONDARY_REBATE;
        } else if (age >= 75) {
            totalRebate += this.SECONDARY_REBATE + this.TERTIARY_REBATE;
        }

        // Apply rebates
        return Math.max(0, annualTax - totalRebate);
    }

    static calculateNetSalary(grossMonthlySalary, age, pensionContribution = 0, travelAllowance = 0, isMonthly = true) {
        if (!grossMonthlySalary || grossMonthlySalary <= 0) {
            return { grossSalary: 0, tax: 0, UIF: 0, netSalary: 0 };
        }

        // Convert to annual if monthly input
        const annualGrossSalary = isMonthly ? grossMonthlySalary * 12 : grossMonthlySalary;

        // Calculate deductions for taxable income
        const annualPensionDeduction = pensionContribution * (isMonthly ? 12 : 1);
        const annualTravelDeduction = travelAllowance * 0.2 * (isMonthly ? 12 : 1);
        const annualTaxableIncome = annualGrossSalary - annualPensionDeduction - annualTravelDeduction;

        // Calculate annual tax and convert to monthly
        const annualTax = this.calculateAnnualTax(annualTaxableIncome, age);
        const monthlyTax = annualTax / 12;

        // Calculate UIF (1% of gross salary, capped)
        const UIF = Math.min(grossMonthlySalary * 0.01, this.UIF_CAP);

        // Calculate final net salary
        const netSalary = grossMonthlySalary - monthlyTax - UIF - pensionContribution;

        return {
            grossSalary: grossMonthlySalary,
            tax: monthlyTax,
            UIF: UIF,
            netSalary: netSalary
        };
    }
}