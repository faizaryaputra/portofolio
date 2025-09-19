import React from "react";
import { useMediaQuery } from "react-responsive";
import Lanyard from "./Lanyard/Lanyard";
import ProfileCard from "./ProfileCard/ProfileCard";

export default function ResponsiveProfile() {
  // HP & Tablet → max 1024px
  const isMobileOrTablet = useMediaQuery({ maxWidth: 1024 });

  return (
    <>
      {isMobileOrTablet ? (
        <ProfileCard />
      ) : (
        <Lanyard position={[0, 0, 12]} gravity={[0, -40, 0]} fov={18} transparent />
      )}
    </>
  );
}
