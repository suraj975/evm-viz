import { useState } from "react";
import { ChevronDownIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  CloseButton,
  Container,
  Flex,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Links } from "../../config/constants";

type MenuLinkProps = {
  text: string;
  link: string;
  newTab?: boolean;
};

function MenuLink(props: MenuLinkProps) {
  const { text, link, newTab = false } = props;

  return (
    <Link
      borderBottomWidth={0}
      borderBottomColor="gray.500"
      _hover={{ textDecoration: "none", borderBottomColor: "black" }}
      fontWeight={500}
      color="black"
      href={link}
      target={newTab ? "_blank" : "_self"}
    >
      {text}
    </Link>
  );
}

function DesktopMenuLinks() {
  return (
    <Stack
      display={["none", "flex", "flex"]}
      shouldWrapChildren
      isInline
      spacing="15px"
      alignItems="center"
      color="gray.50"
      fontSize="15px"
    >
      <MenuLink text={"Tools"} link={Links.tools} />
      <MenuLink text={"Boilerplate"} link={Links.boilerplate} newTab />
      <MenuLink text={"Learn"} link={Links.blog} />
      <MenuLink text={"Zk Chains"} link={Links.zkChains} />
      {/* <MenuLink text={'About'} link={Links.about} /> */}
      <Menu>
        {({ isOpen }) => (
          <>
            <MenuButton
              //@ts-ignore
              isActive={isOpen}
              as={Text}
              color="black"
              rightIcon={<ChevronDownIcon />}
              cursor="pointer"
            >
              {"Playgrounds"}
            </MenuButton>
            <MenuList color="black">
              <MenuItem>
                <MenuLink text={"View all"} link={Links.playgrounds} />
              </MenuItem>
              <MenuItem>
                <MenuLink text={"EIP-712"} link={Links.eip712} />
              </MenuItem>
              <MenuItem>
                <MenuLink text={"ERC-191"} link={Links.erc191} />
              </MenuItem>
              <MenuItem>
                <MenuLink text={"Tx Decoder"} link={Links.txDecoder} />
              </MenuItem>
              <MenuItem>
                <MenuLink text={"Gas Converter"} link={Links.gasConverter} />
              </MenuItem>
              <MenuItem>
                <MenuLink text={"Burner Wallet"} link={Links.burnerWallet} />
              </MenuItem>
              <MenuItem>
                <MenuLink
                  text={"Merkle Tree Generator"}
                  link={Links.merkleTreeGenerator}
                />
              </MenuItem>
              <MenuItem>
                <MenuLink
                  text={"Bytes32 Conversion"}
                  link={Links.byteconversion}
                />
              </MenuItem>
              <MenuItem>
                <MenuLink
                  text={"Deterministic Address"}
                  link={Links.contractAddressGen}
                />
              </MenuItem>
            </MenuList>
          </>
        )}
      </Menu>
      <MenuLink text={"Contribute"} link={Links.contribute} />
      <Link
        ml="10px"
        bgGradient="linear(to-l, gray.700, gray.500)"
        p="7px 10px"
        rounded="4px"
        _hover={{
          textDecoration: "none",
          bgGradient: "linear(to-l, gray.800, gray.800)",
        }}
        target="_blank"
        fontWeight={500}
        href={Links.subscribe}
      >
        Subscribe
      </Link>
    </Stack>
  );
}

function MobileMenuLinks() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconButton
        rounded="5px"
        padding={0}
        aria-label={"Menu"}
        display={["block", "none", "none"]}
        icon={<HamburgerIcon color="black" w="25px" height="25px" />}
        color="black"
        cursor="pointer"
        h="auto"
        bg="transparent"
        _hover={{ bg: "transparent" }}
        _active={{ bg: "transparent" }}
        _focus={{ bg: "transparent" }}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <Stack
          color="gray.100"
          fontSize={["22px", "22px", "22px", "32px"]}
          alignItems="center"
          justifyContent="center"
          pos="fixed"
          left={0}
          right={0}
          bottom={0}
          top={0}
          bg="gray.900"
          spacing="12px"
          zIndex={999}
        >
          <Link href={Links.tools}>Tools</Link>
          <Link href={Links.boilerplate}>Boilerplate</Link>
          <Link href={Links.blog} target="_blank">
            Learn
          </Link>
          <Link href={Links.zkChains}>Zk Chains</Link>
          <Link href={Links.subscribe}>Subscribe</Link>
          <Link href={Links.about}>About</Link>
          <Link href={Links.contribute}>Contribute</Link>
          <CloseButton
            onClick={() => setIsOpen(false)}
            pos="fixed"
            top="40px"
            right="15px"
            size="lg"
          />
        </Stack>
      )}
    </>
  );
}

type GlobalHeaderProps = {
  variant?: "transparent" | "solid";
};

export function GlobalHeader(props: GlobalHeaderProps) {
  const { variant = "solid" } = props;

  return (
    <Box bg={variant === "solid" ? "gray.900" : "transparent"} p="20px 0">
      <Container maxW="container.lg">
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Link
              w="100%"
              display="flex"
              href={Links.home}
              alignItems="center"
              color="black"
              fontWeight={600}
              _hover={{ textDecoration: "none" }}
              fontSize="18px"
            >
              <Image
                alt=""
                h="30px"
                w="30px"
                src="../assets/images/zk-block-logo.svg"
                mr="10px"
              />
              <Text as="span">zkblock</Text>
            </Link>
          </Box>
          <DesktopMenuLinks />
          <MobileMenuLinks />
        </Flex>
      </Container>
    </Box>
  );
}
