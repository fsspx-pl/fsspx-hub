import type { Meta, StoryObj } from "@storybook/react";
import { LocationCard } from "./LocationCard";
import { Tenant } from "@/payload-types";

const meta: Meta<typeof LocationCard> = {
  title: "Pages/Kaplice/LocationCard",
  component: LocationCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LocationCard>;

const mockTenant: Tenant = {
  id: "1",
  name: "Poznań",
  domain: "poznan",
  city: "Poznań",
  type: "Kaplica",
  patron: "Jezusa Chrystusa Najwyższego i Wiecznego Kapłana",
  address: {
    street: "ul. Ptasia 14A",
    zipcode: "60-319",
    email: "poznan.pl@fsspx.email",
    phone: "(+48) 720 728 495",
  },
  coverBackground: {
    id: "1",
    url: "https://via.placeholder.com/300x300",
    filename: "placeholder.jpg",
    mimeType: "image/jpeg",
    filesize: 1000,
    width: 300,
    height: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any,
};

export const Default: Story = {
  args: {
    tenant: mockTenant,
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    tenant: mockTenant,
    isSelected: true,
  },
};

export const WithoutImage: Story = {
  args: {
    tenant: {
      ...mockTenant,
      coverBackground: undefined,
    },
    isSelected: false,
  },
};

export const Mission: Story = {
  args: {
    tenant: {
      ...mockTenant,
      type: "Misja",
      city: "Wrocław",
      patron: "Świętego Józefa",
      address: {
        ...mockTenant.address,
        street: "ul. Przykładowa 1",
        zipcode: "50-000",
        email: "wroclaw.pl@fsspx.email",
        phone: "(+48) 123 456 789",
      },
    },
    isSelected: false,
  },
};
