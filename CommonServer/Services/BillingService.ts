import SubscriptionPlan from 'Common/Types/Billing/SubscriptionPlan';
import OneUptimeDate from 'Common/Types/Date';
import APIException from 'Common/Types/Exception/ApiException';
import BadDataException from 'Common/Types/Exception/BadDataException';
import ObjectID from 'Common/Types/ObjectID';
import Stripe from 'stripe';
import { BillingPrivateKey, IsBillingEnabled } from '../Config';

export class BillingService {
    private static stripe: Stripe = new Stripe(BillingPrivateKey, {
        apiVersion: '2022-08-01',
    });

    // returns billing id of the customer.
    public static async createCustomer(
        name: string,
        id: ObjectID
    ): Promise<string> {
        if (!this.isBillingEnabled()) {
            throw new BadDataException(
                'Billing is not enabled for this server.'
            );
        }

        const customer: Stripe.Response<Stripe.Customer> = await this.stripe.customers.create({
            name,
            metadata: {
                id: id.toString(),
            },
        });

        return customer.id;
    }

    public static async updateCustomerName(
        id: string,
        newName: string
    ): Promise<void> {
        if (!this.isBillingEnabled()) {
            throw new BadDataException(
                'Billing is not enabled for this server.'
            );
        }

        await this.stripe.customers.update(id, { name: newName });
    }

    public static async deleteCustomer(id: string): Promise<void> {
        if (!this.isBillingEnabled()) {
            throw new BadDataException(
                'Billing is not enabled for this server.'
            );
        }

        await this.stripe.customers.del(id);
    }

    public static isBillingEnabled(): boolean {
        return IsBillingEnabled;
    }

    public static async subscribeToPlan(
        customerId: string,
        plan: SubscriptionPlan,
        quantity: number,
        isYearly: boolean,
        hasTrial: boolean
    ): Promise<{
        id: string;
        trialEndsAt: Date;
    }> {
        if (!this.isBillingEnabled()) {
            throw new BadDataException(
                'Billing is not enabled for this server.'
            );
        }

        const subscription: Stripe.Response<Stripe.Subscription> = await this.stripe.subscriptions.create({
            customer: customerId,
            items: [
                {
                    price: isYearly
                        ? plan.getYearlyPlanId()
                        : plan.getMonthlyPlanId(),
                    quantity: quantity,
                },
            ],
            trial_end: hasTrial
                ? OneUptimeDate.getSomeDaysAfter(
                      plan.getTrialPeriod()
                  ).getTime()
                : 'now',
        });

        return {
            id: subscription.id,
            trialEndsAt: hasTrial
                ? OneUptimeDate.getSomeDaysAfter(plan.getTrialPeriod())
                : OneUptimeDate.getCurrentDate(),
        };
    }

    public static async updateSubscription(
        subscriptionId: string,
        plan: SubscriptionPlan,
        quantity: number,
        isYearly: boolean
    ): Promise<void> {
        if (!this.isBillingEnabled()) {
            throw new BadDataException(
                'Billing is not enabled for this server.'
            );
        }

        await this.stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    price: isYearly
                        ? plan.getYearlyPlanId()
                        : plan.getMonthlyPlanId(),
                    quantity: quantity,
                },
            ],
        });
    }

    public static async getSetupIntentSecret(
        customerId: string
    ): Promise<string> {
        const setupIntent: Stripe.Response<Stripe.SetupIntent> = await this.stripe.setupIntents.create({
            customer: customerId,
        });

        if (!setupIntent.client_secret) {
            throw new APIException(
                'client_secret not returned by payment provider.'
            );
        }

        return setupIntent.client_secret;
    }

    public static async cancelSubscription(
        subscriptionId: string
    ): Promise<void> {
        if (!this.isBillingEnabled()) {
            throw new BadDataException(
                'Billing is not enabled for this server.'
            );
        }

        await this.stripe.subscriptions.del(subscriptionId);
    }
}

export default BillingService;
