import {VariantEnum} from "headed-ui";

export interface EventProps {
    variant: VariantEnum;
    name: string;
    description: string;
    date: Date;
    endDate?: Date;
    eventId: string;
}