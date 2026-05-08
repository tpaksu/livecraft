import { useState, useCallback, useRef, useEffect } from '@wordpress/element';
import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { copySmall, external } from '@wordpress/icons';
import Toolbar from './Toolbar';
import InlineEditor from './InlineEditor';
import { createPost, deletePost } from '../utils/api';

export default function App() {
	const autoEdit = window.location.hash === '#livecraft-edit';
	const [ editMode, setEditMode ] = useState( autoEdit );

	// Restore scroll position after exiting edit mode.
	useEffect( () => {
		const savedScroll = window.sessionStorage.getItem(
			'livecraft-scroll'
		);
		if ( savedScroll === null ) {
			return;
		}
		window.sessionStorage.removeItem( 'livecraft-scroll' );
		window.scrollTo( 0, parseInt( savedScroll, 10 ) );
	}, [] );
	const [ saveStatus, setSaveStatus ] = useState( 'idle' );
	const [ postStatus, setPostStatus ] = useState( 'publish' );
	const [ confirmAction, setConfirmAction ] = useState( null );
	const [ resultInfo, setResultInfo ] = useState( null );
	const [ history, setHistory ] = useState( {
		hasUndo: false,
		hasRedo: false,
	} );
	const editorRef = useRef( null );

	const postType = window.livecraft?.postType || 'post';
	const typeLabel =
		postType === 'page'
			? __( 'page', 'livecraft' )
			: __( 'post', 'livecraft' );

	const handleToggleEditMode = useCallback( () => {
		setEditMode( true );
	}, [] );

	const handleSave = useCallback( async () => {
		if ( ! editorRef.current ) {
			return;
		}
		await editorRef.current.saveNow();
	}, [] );

	const handlePublish = useCallback( () => {
		setConfirmAction( {
			type: 'publish',
			title: __( 'Publish', 'livecraft' ),
			message:
				__( 'Are you sure you want to publish this', 'livecraft' ) +
				' ' +
				typeLabel +
				__( '? It will be publicly visible.', 'livecraft' ),
			confirmLabel: __( 'Publish', 'livecraft' ),
		} );
	}, [ typeLabel ] );

	const handleSaveDraft = useCallback( () => {
		setConfirmAction( {
			type: 'draft',
			title: __( 'Switch to Draft', 'livecraft' ),
			message:
				__( 'This will unpublish the', 'livecraft' ) +
				' ' +
				typeLabel +
				__(
					'. It will no longer be publicly accessible.',
					'livecraft'
				),
			confirmLabel: __( 'Switch to Draft', 'livecraft' ),
		} );
	}, [ typeLabel ] );

	const handleConfirm = useCallback( async () => {
		const action = confirmAction;
		setConfirmAction( null );

		if ( ! editorRef.current || ! action ) {
			return;
		}

		let result;
		if ( action.type === 'publish' ) {
			result = await editorRef.current.publishNow();
		} else {
			result = await editorRef.current.saveDraft();
		}

		if ( result ) {
			const isPublish = action.type === 'publish';
			setResultInfo( {
				title: isPublish
					? __( 'Published!', 'livecraft' )
					: __( 'Switched to Draft', 'livecraft' ),
				message: isPublish
					? __( 'Your', 'livecraft' ) +
					  ' ' +
					  typeLabel +
					  ' ' +
					  __( 'is now live.', 'livecraft' )
					: __( 'Your', 'livecraft' ) +
					  ' ' +
					  typeLabel +
					  ' ' +
					  __( 'has been switched to draft.', 'livecraft' ),
				link: result.link,
				linkLabel: isPublish
					? __( 'View', 'livecraft' ) + ' ' + typeLabel
					: __( 'Preview', 'livecraft' ) + ' ' + typeLabel,
			} );
		}
	}, [ confirmAction, typeLabel ] );

	const handleCancelConfirm = useCallback( () => {
		setConfirmAction( null );
	}, [] );

	const handleCloseResult = useCallback( () => {
		setResultInfo( null );
	}, [] );

	const handleCopyLink = useCallback( () => {
		if ( resultInfo?.link ) {
			window.navigator.clipboard.writeText( resultInfo.link );
		}
	}, [ resultInfo ] );

	const [ exitConfirm, setExitConfirm ] = useState( false );

	const doExit = useCallback( () => {
		if ( window.location.hash === '#livecraft-edit' ) {
			window.history.replaceState(
				null,
				'',
				window.location.pathname + window.location.search
			);
		}
		window.sessionStorage.setItem(
			'livecraft-scroll',
			String( window.scrollY )
		);
		window.location.reload();
	}, [] );

	const doExitBack = useCallback( () => {
		if ( window.history.length > 1 ) {
			window.history.back();
		} else {
			window.location.href = window.livecraft?.siteUrl || '/';
		}
	}, [] );

	const handleExit = useCallback( () => {
		const { postId: currentPostId, postType: currentPostType } =
			window.livecraft;

		// New post with no content: delete the draft and go back.
		if ( autoEdit && editorRef.current?.isEmpty() ) {
			deletePost( currentPostType, currentPostId ).catch( () => {} );
			doExitBack();
			return;
		}

		// Cancel the pending auto-save so dirty state is preserved.
		editorRef.current?.cancelPendingSave();

		// Unsaved changes: ask the user what to do.
		if ( editorRef.current?.isDirty() ) {
			setExitConfirm( true );
			return;
		}

		doExit();
	}, [ autoEdit, doExit, doExitBack ] );

	const handleExitSave = useCallback( async () => {
		setExitConfirm( false );
		if ( editorRef.current ) {
			await editorRef.current.saveNow();
		}
		doExit();
	}, [ doExit ] );

	const handleExitDiscard = useCallback( () => {
		setExitConfirm( false );
		doExit();
	}, [ doExit ] );

	const handleExitCancel = useCallback( () => {
		setExitConfirm( false );
	}, [] );

	const handleUndo = useCallback( () => {
		editorRef.current?.undo();
	}, [] );

	const handleRedo = useCallback( () => {
		editorRef.current?.redo();
	}, [] );

	const handleNewContent = useCallback( async ( type ) => {
		const result = await createPost( type, '', '', 'draft' );
		if ( result.link ) {
			window.location.href = result.link + '#livecraft-edit';
		}
	}, [] );

	return (
		<>
			<Toolbar
				editMode={ editMode }
				saveStatus={ saveStatus }
				postStatus={ postStatus }
				hasUndo={ history.hasUndo }
				hasRedo={ history.hasRedo }
				onToggleEditMode={ handleToggleEditMode }
				onSave={ handleSave }
				onPublish={ handlePublish }
				onSaveDraft={ handleSaveDraft }
				onUndo={ handleUndo }
				onRedo={ handleRedo }
				onExit={ handleExit }
				onNewContent={ handleNewContent }
			/>

			{ editMode && (
				<InlineEditor
					ref={ editorRef }
					onSaveStatus={ setSaveStatus }
					onPostStatusChange={ setPostStatus }
					onHistoryChange={ setHistory }
				/>
			) }

			{ confirmAction && (
				<Modal
					title={ confirmAction.title }
					onRequestClose={ handleCancelConfirm }
					className="livecraft-confirm-modal"
					size="small"
				>
					<p>{ confirmAction.message }</p>
					<div className="livecraft-confirm-modal__actions">
						<Button
							variant="tertiary"
							onClick={ handleCancelConfirm }
						>
							{ __( 'Cancel', 'livecraft' ) }
						</Button>
						<Button variant="primary" onClick={ handleConfirm }>
							{ confirmAction.confirmLabel }
						</Button>
					</div>
				</Modal>
			) }

			{ resultInfo && (
				<Modal
					title={ resultInfo.title }
					onRequestClose={ handleCloseResult }
					className="livecraft-result-modal"
					size="small"
				>
					<p>{ resultInfo.message }</p>
					{ resultInfo.link && (
						<div className="livecraft-result-modal__url">
							<code className="livecraft-result-modal__link">
								{ resultInfo.link }
							</code>
							<Button
								icon={ copySmall }
								label={ __( 'Copy URL', 'livecraft' ) }
								onClick={ handleCopyLink }
								size="small"
							/>
						</div>
					) }
					<div className="livecraft-result-modal__actions">
						<Button
							variant="tertiary"
							onClick={ handleCloseResult }
						>
							{ __( 'Done', 'livecraft' ) }
						</Button>
						{ resultInfo.link && (
							<Button
								variant="primary"
								icon={ external }
								href={ resultInfo.link }
								target="_blank"
								rel="noopener noreferrer"
							>
								{ resultInfo.linkLabel }
							</Button>
						) }
					</div>
				</Modal>
			) }

			{ exitConfirm && (
				<Modal
					title={ __( 'Unsaved Changes', 'livecraft' ) }
					onRequestClose={ handleExitCancel }
					className="livecraft-confirm-modal"
					size="small"
				>
					<p>
						{ __(
							'You have unsaved changes. What would you like to do?',
							'livecraft'
						) }
					</p>
					<div className="livecraft-confirm-modal__actions">
						<Button variant="tertiary" onClick={ handleExitCancel }>
							{ __( 'Cancel', 'livecraft' ) }
						</Button>
						<Button
							variant="secondary"
							onClick={ handleExitDiscard }
						>
							{ __( 'Discard', 'livecraft' ) }
						</Button>
						<Button variant="primary" onClick={ handleExitSave }>
							{ __( 'Save & Exit', 'livecraft' ) }
						</Button>
					</div>
				</Modal>
			) }
		</>
	);
}
