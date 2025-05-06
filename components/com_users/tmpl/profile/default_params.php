<?php

/**
 * @package     Joomla.Site
 * @subpackage  com_users
 *
 * @copyright   (C) 2010 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;

/** @var \Joomla\Component\Users\Site\View\Profile\HtmlView $this */
?>
<?php $fields = $this->form->getFieldset('params'); ?>
<?php if (count($fields)) : ?>
    <fieldset id="users-profile-custom" class="com-users-profile__params">
        <legend><?php echo Text::_('COM_USERS_SETTINGS_FIELDSET_LABEL'); ?></legend>
        <dl class="dl-horizontal">
            <?php foreach ($fields as $field) : ?>
                <?php if (!$field->hidden) : ?>
                    <dt>
                        <?php echo $field->title; ?>
                    </dt>
                    <dd>
                    <?php
                    $service = HTMLHelper::getServiceRegistry()->getService('users');

                    foreach ([$field->id, $field->fieldname, $field->type, 'value'] as $key) {
                        if (HTMLHelper::isRegistered('users.' . $key) || is_callable([$service, $key])) {
                            echo HTMLHelper::_('users.' . $key, $field->value);
                            break;
                        }
                    }
                    ?>
                    </dd>
                <?php endif; ?>
            <?php endforeach; ?>
        </dl>
    </fieldset>
<?php endif; ?>
