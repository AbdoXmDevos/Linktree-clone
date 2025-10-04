"use client";

import { Menu, ActionIcon, Divider } from "@mantine/core";
import { 
  IconDots, 
  IconEdit, 
  IconTrash, 
  IconCopy, 
  IconStar, 
  IconStarFilled,
  IconEye,
  IconLink,
  IconShare,
  IconArrowUp,
  IconArrowDown
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { colors } from "../../styles/design-tokens";
import type { Link } from "../../../types/dashboard";

interface ContextMenuProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (linkId: string) => void;
  onToggleFeatured?: (linkId: string) => void;
  onCopyUrl?: (url: string) => void;
  onPreview?: (link: Link) => void;
  onShare?: (link: Link) => void;
  onMoveUp?: (linkId: string) => void;
  onMoveDown?: (linkId: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export function ContextMenu({
  link,
  onEdit,
  onDelete,
  onToggleFeatured,
  onCopyUrl,
  onPreview,
  onShare,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: ContextMenuProps) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(link.url);
    onCopyUrl?.(link.url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: link.description || link.title,
          url: link.url,
        });
      } catch (error) {
        // Fallback to copy URL
        handleCopyUrl();
      }
    } else {
      // Fallback to copy URL
      handleCopyUrl();
    }
    onShare?.(link);
  };

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            radius="md"
            style={{
              transition: "all 0.2s ease",
            }}
          >
            <IconDots size={16} />
          </ActionIcon>
        </motion.div>
      </Menu.Target>

      <Menu.Dropdown>
        {/* Primary Actions */}
        <Menu.Item
          leftSection={<IconEdit size={16} />}
          onClick={() => onEdit(link)}
        >
          Edit Link
        </Menu.Item>

        <Menu.Item
          leftSection={<IconEye size={16} />}
          onClick={() => onPreview?.(link)}
        >
          Preview
        </Menu.Item>

        <Divider />

        {/* Secondary Actions */}
        <Menu.Item
          leftSection={<IconCopy size={16} />}
          onClick={handleCopyUrl}
        >
          Copy URL
        </Menu.Item>

        <Menu.Item
          leftSection={<IconShare size={16} />}
          onClick={handleShare}
        >
          Share Link
        </Menu.Item>

        {onToggleFeatured && (
          <Menu.Item
            leftSection={
              link.is_featured ? (
                <IconStarFilled size={16} color={colors.warning[500]} />
              ) : (
                <IconStar size={16} />
              )
            }
            onClick={() => onToggleFeatured(link.id)}
          >
            {link.is_featured ? "Remove from Featured" : "Add to Featured"}
          </Menu.Item>
        )}

        <Divider />

        {/* Order Actions */}
        {onMoveUp && canMoveUp && (
          <Menu.Item
            leftSection={<IconArrowUp size={16} />}
            onClick={() => onMoveUp(link.id)}
          >
            Move Up
          </Menu.Item>
        )}

        {onMoveDown && canMoveDown && (
          <Menu.Item
            leftSection={<IconArrowDown size={16} />}
            onClick={() => onMoveDown(link.id)}
          >
            Move Down
          </Menu.Item>
        )}

        <Divider />

        {/* Destructive Actions */}
        <Menu.Item
          leftSection={<IconTrash size={16} />}
          color="red"
          onClick={() => onDelete(link.id)}
        >
          Delete Link
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}